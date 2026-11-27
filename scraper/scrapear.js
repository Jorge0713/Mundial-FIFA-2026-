// Scraper de la API pública de la FIFA (Copa Mundial 2026) -> scripts de datos semilla
// Uso:  node scraper/scrapear.js
// Genera un .sql por tabla en datos_semilla/. Las respuestas de la API se guardan en
// scraper/.cache para no repetir peticiones; bórrala para volver a descargar.
const fs = require('fs');
const path = require('path');

const API = 'https://api.fifa.com/api/v3';
const COMP = 17, TEMP = 285023; // Copa Mundial de la FIFA 2026
const CACHE = path.join(__dirname, '.cache');
const SALIDA = path.join(__dirname, '..', 'datos_semilla');

// Datos del estadio que la API no trae (nombre real, capacidades y dirección).
// Se scrapearon con el navegador; fuentes y fecha dentro del archivo.
const ESTADIOS = require('./fuentes/estadios.json');
const DATO_ESTADIO = new Map(ESTADIOS.estadios.map(e => [e.nombre_fifa, e]));
// Rondas del torneo (catálogo fijo; la API devuelve "Bronze final" sin traducir)
const RONDAS = [
  ['Fase de grupos', false], ['Dieciseisavos de final', true], ['Octavos de final', true],
  ['Cuartos de final', true], ['Semifinales', true], ['Partido por el tercer lugar', true], ['Final', true],
];
const CATALOGOS = require('./fuentes/catalogos.json');
// Catálogo de eventos: todos los tipos que aparecen en las cronologías de los 104 partidos.
// Nombre limpio y tipos (Type) de la API que le corresponden; la API repite nombres
// ("Sorteo de campos" son 79 a 82, "Retraso" 83 y 85). "Falta" es el tiro libre.
const EVENTOS = [
  ['Gol', [0]], ['Gol en propia puerta', [34]], ['Gol de penal', [41]], ['Asistencia', [1]],
  ['Penal señalado', [6]], ['Penal fallado', [60]],
  ['Tarjeta amarilla', [2]], ['Segunda tarjeta amarilla', [4]], ['Tarjeta roja', [3]],
  ['Falta', [18]], ['Saque de esquina', [16]], ['Fuera de juego', [15]],
  ['Remate', [12]], ['Parada', [57]], ['Sustitución', [5]], ['Revisión del VAR', [71]],
  ['Sorteo de campos', [79, 80, 81, 82]], ['Inicio de periodo', [7]], ['Fin de periodo', [8]],
  ['Retraso', [83, 85]], ['Reanudación', [78]], ['Final de partido', [26]],
];
// Period de /timelines
const PERIODO = { 2: 'antes_del_partido', 3: 'primer_tiempo', 4: 'descanso', 5: 'segundo_tiempo',
  17: 'antes_de_prorroga', 7: 'prorroga_primer_tiempo', 8: 'descanso_prorroga', 9: 'prorroga_segundo_tiempo',
  16: 'antes_de_penales', 11: 'tanda_penales', 10: 'fin_del_partido' };
// OfficialType de /live/football, sin las formas "o/a" de la API
const ROL = { 1: 'Árbitro', 2: 'Primer árbitro asistente', 3: 'Segundo árbitro asistente',
  4: 'Cuarto árbitro', 5: 'Árbitro asistente de video (VAR)', 6: 'Árbitro de reserva',
  8: 'Asistente del VAR', 9: 'Asistente de apoyo' };
const POSICION = ['arquero', 'defensor', 'mediocampista', 'delantero']; // Position 0..3 de la API
const CARGO = { 0: 'director_tecnico', 1: 'auxiliar_tecnico' }; // Role de la API (convocatoria y Coaches)
// Role de los Staffs de /live/football. La FIFA no publica el nombre del cargo (en su sitio solo
// dice "(Staff)"); estos se identificaron con personas conocidas: 2 Saafan El-Saghir (Egipto) y
// Hugo Tocalli (Argentina); 12 Luis Martín (Argentina), Pierre Barrieu (Canadá); 6 Luis García
// (Argentina); 8 Sérgio Luís de Oliveira (Brasil); 16 Ibrahim Hassan (Egipto), Sam Zapatka (EE. UU.).
// Los demás códigos (1, 3, 4, 5, 7, 10, 11, 13, 14, 15 y 9999) no se pudieron identificar: "otro".
const CARGO_STAFF = { 2: 'entrenador_porteros', 12: 'preparador_fisico', 6: 'fisioterapeuta', 8: 'masajista', 16: 'jefe_de_equipo' };
const ORDEN_CARGO = ['director_tecnico', 'auxiliar_tecnico', 'entrenador_porteros', 'preparador_fisico',
  'fisioterapeuta', 'masajista', 'jefe_de_equipo', 'otro'];

async function api(ruta) {
  const archivo = path.join(CACHE, ruta.replace(/[^\w]+/g, '_') + '.json');
  if (fs.existsSync(archivo)) return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const sep = ruta.includes('?') ? '&' : '?';
  const r = await fetch(`${API}${ruta}${sep}language=es`);
  if (!r.ok) throw new Error(`${r.status} en ${ruta}`);
  const d = await r.json();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(archivo, JSON.stringify(d));
  return d;
}

// Estadísticas de equipo (posesión) del FIFA Data Hub, por el IdIFES del partido
async function fdh(ruta) {
  const archivo = path.join(CACHE, 'fdh' + ruta.replace(/[^\w]+/g, '_') + '.json');
  if (fs.existsSync(archivo)) return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const r = await fetch(`https://fdh-api.fifa.com${ruta}`);
  if (!r.ok) throw new Error(`${r.status} en ${ruta}`);
  const d = await r.json();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(archivo, JSON.stringify(d));
  return d;
}

const txt = arr => (arr && arr[0] ? arr[0].Description : null);
const sql = v => (v === null || v === undefined ? 'NULL'
  : typeof v === 'number' || typeof v === 'boolean' ? String(v)
  : `'${String(v).replace(/'/g, "''")}'`);

// "DE LA FUENTE" -> "de la Fuente", "RANGEL" -> "Rangel"
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'van', 'der', 'den', 'von', 'da', 'das', 'do', 'dos', 'di', 'le', 'el', 'al', 'bin', 'ben']);
function titulo(s) {
  return s.toLowerCase().split(' ').map((p, i) => (i > 0 && PARTICULAS.has(p) ? p
    : p.replace(/(^|[-'’])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()))).join(' ');
}
const esMayus = t => /\p{L}/u.test(t) && t === t.toUpperCase() && t.replace(/\P{L}/gu, '').length > 1;

// La FIFA escribe el apellido en mayúsculas ("Raul RANGEL"). Si el nombre viene todo en
// mayúsculas o todo en minúsculas, se usa el nombre corto ("R. RANGEL") para separarlo.
function separar(completo, corto) {
  completo = completo.trim().replace(/\s+/g, ' ');
  const tok = completo.split(' ');
  const mayus = tok.map(esMayus);
  if (mayus.some(Boolean) && !mayus.every(Boolean)) {
    const i = mayus.indexOf(true);
    if (mayus.slice(i).every(Boolean)) // "Raul RANGEL": apellido al final
      return [tok.slice(0, i).join(' '), titulo(tok.slice(i).join(' '))];
    const k = mayus.indexOf(false);     // "LEE Hanbeom": apellido primero (orden asiático)
    if (mayus.slice(0, k).every(Boolean) && !mayus.slice(k).some(Boolean))
      return [tok.slice(k).join(' '), titulo(tok.slice(0, k).join(' '))];
  }
  const m = corto && corto.match(/^\S+\.\s+(.+)$/);
  if (m) {
    const ap = m[1].trim();
    if (completo.toUpperCase().endsWith(' ' + ap.toUpperCase())) {
      const nom = completo.slice(0, completo.length - ap.length).trim();
      return [mayus.every(Boolean) ? titulo(nom) : nom, titulo(ap)];
    }
  }
  if (tok.length === 1) return [titulo(completo), null];
  // Sin forma de distinguir: último token como apellido
  return [mayus.every(Boolean) ? titulo(tok.slice(0, -1).join(' ')) : tok.slice(0, -1).join(' '),
    titulo(tok[tok.length - 1])];
}

// Nombre de un técnico o miembro del staff. Se usa la variante que marca el apellido en
// mayúsculas ("Walter SAMUEL"); si ninguna lo marca, el alias ("BUBISTA") y luego el nombre completo
function nombreOficial(o) {
  const variantes = [...(o.Name || []), ...(o.Alias || [])].map(v => v.Description.trim());
  const marcada = variantes.find(v => { const m = v.split(/\s+/).map(esMayus); return m.some(Boolean) && !m.every(Boolean); });
  return separar(marcada || txt(o.Alias) || txt(o.Name), null);
}

function escribir(archivo, tabla, columnas, filas, nota) {
  const lineas = [
    `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES`,
    filas.map(f => `    (${f.map(sql).join(', ')})`).join(',\n') + ';',
    '',
    `SELECT setval(pg_get_serial_sequence('${tabla}', '${columnas[0]}'), (SELECT MAX(${columnas[0]}) FROM ${tabla}));`,
    '',
  ];
  // Las tablas subtipo e intermedias no tienen secuencia propia
  if (!/_id$/.test(columnas[0]) || ['jugador', 'cuerpo_tecnico', 'nivel_amenidad', 'nivel_version'].includes(tabla)) lineas.splice(-3, 2);
  fs.writeFileSync(path.join(SALIDA, archivo), lineas.join('\n'));
  console.log(`${archivo}: ${filas.length}`);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const partidos = (await api(`/calendar/matches?idCompetition=${COMP}&idSeason=${TEMP}&count=200`)).Results;
  const paises = (await api('/countries?count=300')).Results;

  // Selecciones y su grupo (sale de sus partidos de la fase de grupos)
  const equipos = new Map();
  for (const p of partidos)
    for (const e of [p.Home, p.Away])
      if (e && e.IdTeam) {
        const q = equipos.get(e.IdTeam) || { id: e.IdTeam, nombre: txt(e.TeamName), codigo: e.Abbreviation };
        if (p.IdGroup) q.grupo = txt(p.GroupName).replace('Grupo ', '');
        equipos.set(e.IdTeam, q);
      }
  for (const q of equipos.values()) {
    q.plantel = await api(`/teams/${q.id}/squad?idCompetition=${COMP}&idSeason=${TEMP}`);
  }
  const sel = [...equipos.values()].sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nombre.localeCompare(b.nombre, 'es'));

  // Staff de cada selección que no viene en la convocatoria: los Staffs que la FIFA publica en
  // cada partido y los técnicos que dirigieron sin estar en la convocatoria (Túnez). Su fecha de
  // nacimiento y país salen de /coaches/{id}.
  const enConvocatoria = new Set(sel.flatMap(q => q.plantel.Officials.map(o => o.IdCoach)));
  const staff = new Map();
  for (const p of partidos) {
    const l = await api(`/live/football/${COMP}/${TEMP}/${p.IdStage}/${p.IdMatch}`);
    for (const t of [l.HomeTeam, l.AwayTeam]) {
      for (const x of t.Staffs || [])
        if (!staff.has(x.IdStaff)) staff.set(x.IdStaff, { id: x.IdStaff, equipo: t.IdTeam, cargo: CARGO_STAFF[x.Role] || 'otro' });
      for (const x of t.Coaches || [])
        if (!enConvocatoria.has(x.IdCoach) && !staff.has(x.IdCoach)) staff.set(x.IdCoach, { id: x.IdCoach, equipo: t.IdTeam, cargo: CARGO[x.Role] });
    }
  }
  for (const x of staff.values()) x.ficha = await api(`/coaches/${x.id}`);

  // Estadios y ciudades
  const estadios = new Map();
  for (const p of partidos) estadios.set(p.Stadium.IdStadium, p.Stadium);

  // 01 País: solo los que se usan (países sede y nacionalidad del cuerpo técnico)
  const usados = new Set([...estadios.values()].map(s => s.IdCountry));
  for (const q of sel) for (const o of q.plantel.Officials) usados.add(o.IdCountry);
  for (const x of staff.values()) usados.add(x.ficha.IdCountry);
  const paisId = new Map();
  const paisFilas = paises.filter(p => usados.has(p.IdCountry))
    .sort((a, b) => txt(a.Alias).localeCompare(txt(b.Alias), 'es'))
    .map((p, i) => { paisId.set(p.IdCountry, i + 1); return [i + 1, p.IdCountry, txt(p.Alias) || p.Name]; });
  const faltan = [...usados].filter(c => !paisId.has(c));
  if (faltan.length) throw new Error('Países sin catálogo: ' + faltan.join(', '));
  escribir('01_seed_pais.sql', 'pais', ['pais_id', 'codigo', 'nombre'], paisFilas,
    'Solo países referenciados: sedes y nacionalidad del cuerpo técnico');

  // 02 Grupo
  const grupos = [...new Set(sel.map(q => q.grupo))].sort();
  const grupoId = new Map(grupos.map((g, i) => [g, i + 1]));
  escribir('02_seed_grupo.sql', 'grupo', ['grupo_id', 'nombre'], grupos.map((g, i) => [i + 1, g]));

  // 03 Ronda
  escribir('03_seed_ronda.sql', 'ronda', ['ronda_id', 'nombre', 'orden', 'es_eliminatoria'],
    RONDAS.map(([n, e], i) => [i + 1, n, i + 1, e]), 'Catálogo fijo del formato de 48 selecciones');

  // 04 Selección
  const selId = new Map();
  escribir('04_seed_seleccion.sql', 'seleccion', ['seleccion_id', 'nombre', 'codigo', 'grupo_id'],
    sel.map((q, i) => { selId.set(q.id, i + 1); return [i + 1, q.nombre, q.codigo, grupoId.get(q.grupo)]; }));

  // 05 Ciudad sede y 06 Estadio
  const ciudades = new Map();
  for (const s of estadios.values()) ciudades.set(txt(s.CityName), s.IdCountry);
  const ciudadOrden = [...ciudades.keys()].sort((a, b) => a.localeCompare(b, 'es'));
  const ciudadId = new Map(ciudadOrden.map((c, i) => [c, i + 1]));
  escribir('05_seed_ciudad_sede.sql', 'ciudad_sede', ['ciudad_sede_id', 'nombre', 'pais_id'],
    ciudadOrden.map((c, i) => [i + 1, c, paisId.get(ciudades.get(c))]));
  const est = [...estadios.values()].sort((a, b) => txt(a.Name).localeCompare(txt(b.Name), 'es'));
  for (const s of est) if (!DATO_ESTADIO.has(txt(s.Name))) throw new Error('Sin datos en fuentes/estadios.json: ' + txt(s.Name));
  const estadioId = new Map(est.map((s, i) => [s.IdStadium, i + 1]));
  escribir('06_seed_estadio.sql', 'estadio',
    ['estadio_id', 'nombre', 'nombre_fifa', 'capacidad', 'capacidad_fifa', 'direccion',
      'municipio', 'estado', 'codigo_postal', 'ciudad_sede_id'],
    est.map((s, i) => {
      const e = DATO_ESTADIO.get(txt(s.Name));
      // Formato local: México "Calle 123, Colonia"; Estados Unidos y Canadá "123 Calle, Barrio"
      const via = s.IdCountry === 'MEX' ? `${e.calle} ${e.numero}` : `${e.numero} ${e.calle}`;
      const direccion = e.colonia ? `${via}, ${e.colonia}` : via;
      return [i + 1, e.nombre, txt(s.Name), e.capacidad, e.capacidad_fifa, direccion,
        e.municipio, e.estado, e.codigo_postal, ciudadId.get(txt(s.CityName))];
    }),
    Object.entries(ESTADIOS._fuentes).map(([k, v]) => `${k}: ${v}`).join('\n-- '));

  // 07 Personal, 08 Jugador, 09 Cuerpo técnico
  const personal = [], jugadores = [], tecnicos = [];
  const personaId = new Map(); // IdPlayer / IdCoach de la FIFA -> personal_seleccion_id
  let id = 0;
  for (const q of sel) {
    const pl = [...q.plantel.Players].sort((a, b) => a.JerseyNum - b.JerseyNum);
    for (const j of pl) {
      const [nom, ap] = separar(txt(j.PlayerName), txt(j.ShortName));
      personal.push([++id, nom, ap, j.BirthDate.slice(0, 10), selId.get(q.id)]);
      personaId.set(j.IdPlayer, id);
      jugadores.push([id, POSICION[j.Position], j.JerseyNum]);
    }
    const of = [...q.plantel.Officials].sort((a, b) => a.Role - b.Role);
    for (const o of of) {
      const [nom, ap] = nombreOficial(o);
      personal.push([++id, nom, ap, o.BirthDate.slice(0, 10), selId.get(q.id)]);
      personaId.set(o.IdCoach, id);
      tecnicos.push([id, paisId.get(o.IdCountry), CARGO[o.Role]]);
    }
  }
  // El resto del staff va al final, para no mover los ids de jugadores y convocatoria
  for (const q of sel) {
    const suyos = [...staff.values()].filter(x => x.equipo === q.id).map(x => ({ ...x, nombre: nombreOficial(x.ficha) }))
      .sort((a, b) => ORDEN_CARGO.indexOf(a.cargo) - ORDEN_CARGO.indexOf(b.cargo)
        || (a.nombre[1] || a.nombre[0]).localeCompare(b.nombre[1] || b.nombre[0], 'es'));
    for (const x of suyos) {
      personal.push([++id, x.nombre[0], x.nombre[1], x.ficha.BirthDate.slice(0, 10), selId.get(q.id)]);
      personaId.set(x.id, id);
      tecnicos.push([id, paisId.get(x.ficha.IdCountry), x.cargo]);
    }
  }
  escribir('07_seed_personal_seleccion.sql', 'personal_seleccion',
    ['personal_seleccion_id', 'nombre', 'apellido', 'fecha_nacimiento', 'seleccion_id'], personal,
    'Convocatorias oficiales: jugadores ordenados por dorsal y después el cuerpo técnico de cada selección');
  escribir('08_seed_jugador.sql', 'jugador', ['personal_seleccion_id', 'posicion', 'dorsal'], jugadores);
  escribir('09_seed_cuerpo_tecnico.sql', 'cuerpo_tecnico', ['personal_seleccion_id', 'pais_id', 'cargo'], tecnicos,
    'La FIFA solo publica dos cargos: director técnico (Role 0) y auxiliar técnico (Role 1)');

  // 10 a 16 Catálogos de hospitalidad y boletos (scraper/fuentes/catalogos.json)
  const C = CATALOGOS;
  escribir('10_seed_nivel.sql', 'nivel', ['nivel_id', 'nombre', 'descripcion'], C.nivel.map((x, i) => [i + 1, x.nombre, x.descripcion]));
  escribir('11_seed_amenidad.sql', 'amenidad', ['amenidad_id', 'nombre'], C.amenidad.map((x, i) => [i + 1, x.nombre]));
  const idDe = (lista, nombre) => {
    const i = lista.findIndex(x => x.nombre === nombre);
    if (i < 0) throw new Error(`No existe "${nombre}" en catalogos.json`);
    return i + 1;
  };
  const nivelAmenidad = [], nivelVersion = [];
  for (const n of C.nivel) {
    for (const a of [...C.nivel_amenidad.todos, ...C.nivel_amenidad[n.nombre]])
      nivelAmenidad.push([idDe(C.nivel, n.nombre), idDe(C.amenidad, a)]);
    for (const v of C.nivel_version[n.nombre])
      nivelVersion.push([idDe(C.nivel, n.nombre), v]);
  }
  escribir('12_seed_nivel_amenidad.sql', 'nivel_amenidad', ['nivel_id', 'amenidad_id'], nivelAmenidad);
  escribir('13_seed_nivel_version.sql', 'nivel_version', ['nivel_id', 'version'], nivelVersion);
  escribir('14_seed_paquete.sql', 'paquete', ['paquete_id', 'nombre', 'descripcion'], C.paquete.map((x, i) => [i + 1, x.nombre, x.descripcion]));
  escribir('15_seed_categoria.sql', 'categoria', ['categoria_id', 'nombre', 'descripcion'], C.categoria.map((x, i) => [i + 1, x.nombre, x.descripcion]));
  escribir('16_seed_fase_venta.sql', 'fase_venta', ['fase_venta_id', 'nombre', 'fecha_inicio', 'fecha_fin'],
    C.fase_venta.map((x, i) => [i + 1, x.nombre, x.fecha_inicio, x.fecha_fin]));

  // 17 Evento y 18 Rol: tipos que aparecen en los 104 partidos (cronología y árbitros)
  const tipoRol = new Set(), finPartido = new Map(), cronologias = new Map(), posesion = new Map();
  for (const p of partidos) {
    const ruta = `${COMP}/${TEMP}/${p.IdStage}/${p.IdMatch}`;
    const eventosPartido = (await api(`/timelines/${ruta}`)).Event || [];
    cronologias.set(p.IdMatch, eventosPartido);
    for (const e of eventosPartido)
      // Tipo 26 "Final de partido". El M85 lo trae dos veces (la segunda 27 minutos
      // después, ya sin juego): se toma el primero
      if (e.Type === 26 && (!finPartido.has(p.IdMatch) || e.Timestamp < finPartido.get(p.IdMatch)))
        finPartido.set(p.IdMatch, e.Timestamp);
    for (const o of (await api(`/live/football/${ruta}`)).Officials || []) tipoRol.add(o.OfficialType);
    // Posesión del balón (fracción 0 a 1 por equipo; el resto es balón en disputa)
    const stats = await fdh(`/v1/stats/match/${p.Properties.IdIFES}/teams.json`);
    const pos = e => { const s = e && (stats[e.IdTeam] || []).find(x => x[0] === 'Possession'); return s ? Math.round(s[1] * 10000) / 100 : null; };
    posesion.set(p.IdMatch, [pos(p.Home), pos(p.Away)]);
  }
  const eventoId = new Map();
  EVENTOS.forEach(([, tipos], i) => tipos.forEach(t => eventoId.set(t, i + 1)));
  for (const lista of cronologias.values()) for (const e of lista) {
    if (!eventoId.has(e.Type)) throw new Error(`Tipo de evento ${e.Type} (${txt(e.TypeLocalized)}) sin nombre en EVENTOS`);
    if (!(e.Period in PERIODO)) throw new Error(`Periodo ${e.Period} sin nombre en PERIODO`);
  }
  escribir('17_seed_evento.sql', 'evento', ['evento_id', 'nombre'], EVENTOS.map(([n], i) => [i + 1, n]));
  const roles = [...tipoRol].sort((a, b) => a - b).map(t => ROL[t]).filter(Boolean);
  escribir('18_seed_rol.sql', 'rol', ['rol_id', 'nombre'], roles.map((n, i) => [i + 1, n]));

  // 19 Partido_venta (fecha, estadio, ronda) y 20 Partido (lo que pasó en la cancha), en orden de
  // número de partido: partido_venta_id = partido_id = M1..M104 de la FIFA.
  // Fecha y horas en hora local del estadio. Inicio = hora programada (LocalDate de la API,
  // que viene con "Z" pero ya es hora local); término = evento "Final de partido" (UTC)
  // movido a hora local con la diferencia entre LocalDate y Date.
  const iso = s => {
    if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/.test(s)) throw new Error('Fecha inesperada: ' + s);
    return new Date(s);
  };
  const local = (p, utc) => new Date(iso(utc).getTime() + iso(p.LocalDate).getTime() - iso(p.Date).getTime());
  const fecha = d => d.toISOString().slice(0, 10);
  const hora = d => d.toISOString().slice(11, 19);
  const porNumero = [...partidos].sort((a, b) => a.MatchNumber - b.MatchNumber);
  porNumero.forEach((p, i) => { if (p.MatchNumber !== i + 1) throw new Error(`Falta el partido ${i + 1}`); });
  // Las rondas de la API se ordenan por su primer partido (grupos M1, dieciseisavos M73...)
  const etapas = [...new Set(porNumero.map(p => p.IdStage))];
  if (etapas.length !== RONDAS.length) throw new Error(`La API trae ${etapas.length} rondas, se esperaban ${RONDAS.length}`);
  const rondaId = new Map(etapas.map((s, i) => [s, i + 1]));
  const equipo = e => (e && e.IdTeam ? selId.get(e.IdTeam) : null);
  escribir('19_seed_partido_venta.sql', 'partido_venta', ['partido_venta_id', 'fecha', 'estadio_id', 'ronda_id'],
    porNumero.map(p => [p.MatchNumber, fecha(iso(p.LocalDate)), estadioId.get(p.Stadium.IdStadium), rondaId.get(p.IdStage)]));
  escribir('20_seed_partido.sql', 'partido',
    ['partido_id', 'partido_venta_id', 'hora_inicio', 'hora_termino', 'asistencia', 'local_id', 'visitante_id',
      'plantilla_local', 'plantilla_visitante', 'posesion_local', 'posesion_visitante'],
    porNumero.map(p => [p.MatchNumber, p.MatchNumber, hora(iso(p.LocalDate)),
      finPartido.has(p.IdMatch) ? hora(local(p, finPartido.get(p.IdMatch))) : null,
      p.Attendance ? Number(p.Attendance) : null,
      equipo(p.Home), equipo(p.Away),
      (p.Home && p.Home.Tactics) || null, (p.Away && p.Away.Tactics) || null,
      ...posesion.get(p.IdMatch)]));

  // 21 Cronología: cada evento de cada partido, en orden de partido y de hora del evento.
  // entra_id = quien hace la jugada (o el jugador que entra en una sustitución);
  // sale_id = el jugador que sale, solo en sustituciones. Las amonestaciones a técnicos
  // vienen en IdPerson; si la persona no está en las convocatorias queda nula.
  const filasCrono = [];
  let sinPersona = 0;
  const persona = fifaId => {
    if (!fifaId) return null;
    if (!personaId.has(fifaId)) { sinPersona++; return null; }
    return personaId.get(fifaId);
  };
  for (const p of porNumero) {
    const lista = [...cronologias.get(p.IdMatch)].sort((a, b) => iso(a.Timestamp) - iso(b.Timestamp));
    for (const e of lista) {
      const m = (e.MatchMinute || '').match(/^(\d+)'(?:\+(\d+)')?$/);
      if (e.MatchMinute && !m) throw new Error(`Minuto inesperado: ${e.MatchMinute}`);
      filasCrono.push([filasCrono.length + 1, p.MatchNumber, eventoId.get(e.Type), PERIODO[e.Period],
        m ? Number(m[1]) : null, m && m[2] ? Number(m[2]) : null,
        persona(e.IdPlayer || e.IdPerson), e.Type === 5 ? persona(e.IdSubPlayer) : null]);
    }
  }
  escribir('21_seed_cronologia.sql', 'cronologia',
    ['cronologia_id', 'partido_id', 'evento_id', 'periodo', 'minuto', 'tiempo_agregado', 'entra_id', 'sale_id'], filasCrono);
  if (sinPersona) console.log(`  ${sinPersona} personas de la cronología no están en las convocatorias (quedan nulas)`);
})().catch(e => { console.error(e.message); process.exit(1); });
