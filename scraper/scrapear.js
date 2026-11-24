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
const POSICION = ['arquero', 'defensor', 'mediocampista', 'delantero']; // Position 0..3 de la API
const CARGO = { 0: 'director_tecnico', 1: 'auxiliar_tecnico' }; // Role de la API

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

function escribir(archivo, tabla, columnas, filas, nota) {
  const lineas = [
    `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES`,
    filas.map(f => `    (${f.map(sql).join(', ')})`).join(',\n') + ';',
    '',
    `SELECT setval(pg_get_serial_sequence('${tabla}', '${columnas[0]}'), (SELECT MAX(${columnas[0]}) FROM ${tabla}));`,
    '',
  ];
  // Las tablas subtipo no tienen secuencia propia
  if (!/_id$/.test(columnas[0]) || ['jugador', 'cuerpo_tecnico'].includes(tabla)) lineas.splice(-3, 2);
  fs.writeFileSync(path.join(SALIDA, archivo), lineas.join('\n'));
  console.log(`${archivo}: ${filas.length}`);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const partidos = (await api(`/calendar/matches?idCompetition=${COMP}&idSeason=${TEMP}&count=200`)).Results;
  const confeds = (await api('/confederations')).Results;
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
    q.confed = (await api(`/teams/${q.id}`)).IdConfederation;
    q.plantel = await api(`/teams/${q.id}/squad?idCompetition=${COMP}&idSeason=${TEMP}`);
  }
  const sel = [...equipos.values()].sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nombre.localeCompare(b.nombre, 'es'));

  // Estadios y ciudades
  const estadios = new Map();
  for (const p of partidos) estadios.set(p.Stadium.IdStadium, p.Stadium);

  // 01 Confederación
  const confedId = new Map();
  const confFilas = confeds.map((c, i) => { confedId.set(c.IdConfederation, i + 1); return [i + 1, c.IdConfederation, txt(c.Name)]; });
  escribir('01_seed_confederacion.sql', 'confederacion', ['confederacion_id', 'siglas', 'nombre'], confFilas);

  // 02 País: solo los que se usan (países sede y nacionalidad del cuerpo técnico)
  const usados = new Set([...estadios.values()].map(s => s.IdCountry));
  for (const q of sel) for (const o of q.plantel.Officials) usados.add(o.IdCountry);
  const paisId = new Map();
  const paisFilas = paises.filter(p => usados.has(p.IdCountry))
    .sort((a, b) => txt(a.Alias).localeCompare(txt(b.Alias), 'es'))
    .map((p, i) => { paisId.set(p.IdCountry, i + 1); return [i + 1, p.IdCountry, txt(p.Alias) || p.Name]; });
  const faltan = [...usados].filter(c => !paisId.has(c));
  if (faltan.length) throw new Error('Países sin catálogo: ' + faltan.join(', '));
  escribir('02_seed_pais.sql', 'pais', ['pais_id', 'codigo', 'nombre'], paisFilas,
    'Solo países referenciados: sedes y nacionalidad del cuerpo técnico');

  // 03 Grupo
  const grupos = [...new Set(sel.map(q => q.grupo))].sort();
  const grupoId = new Map(grupos.map((g, i) => [g, i + 1]));
  escribir('03_seed_grupo.sql', 'grupo', ['grupo_id', 'nombre'], grupos.map((g, i) => [i + 1, g]));

  // 04 Ronda
  escribir('04_seed_ronda.sql', 'ronda', ['ronda_id', 'nombre', 'orden', 'es_eliminatoria'],
    RONDAS.map(([n, e], i) => [i + 1, n, i + 1, e]), 'Catálogo fijo del formato de 48 selecciones');

  // 05 Selección
  const selId = new Map();
  escribir('05_seed_seleccion.sql', 'seleccion', ['seleccion_id', 'nombre', 'codigo', 'confederacion_id', 'grupo_id'],
    sel.map((q, i) => { selId.set(q.id, i + 1); return [i + 1, q.nombre, q.codigo, confedId.get(q.confed), grupoId.get(q.grupo)]; }));

  // 06 Ciudad sede y 07 Estadio
  const ciudades = new Map();
  for (const s of estadios.values()) ciudades.set(txt(s.CityName), s.IdCountry);
  const ciudadOrden = [...ciudades.keys()].sort((a, b) => a.localeCompare(b, 'es'));
  const ciudadId = new Map(ciudadOrden.map((c, i) => [c, i + 1]));
  escribir('06_seed_ciudad_sede.sql', 'ciudad_sede', ['ciudad_sede_id', 'nombre', 'pais_id'],
    ciudadOrden.map((c, i) => [i + 1, c, paisId.get(ciudades.get(c))]));
  const est = [...estadios.values()].sort((a, b) => txt(a.Name).localeCompare(txt(b.Name), 'es'));
  for (const s of est) if (!DATO_ESTADIO.has(txt(s.Name))) throw new Error('Sin datos en fuentes/estadios.json: ' + txt(s.Name));
  escribir('07_seed_estadio.sql', 'estadio',
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

  // 08 Personal, 09 Jugador, 10 Cuerpo técnico
  const personal = [], jugadores = [], tecnicos = [];
  let id = 0;
  for (const q of sel) {
    const pl = [...q.plantel.Players].sort((a, b) => a.JerseyNum - b.JerseyNum);
    for (const j of pl) {
      const [nom, ap] = separar(txt(j.PlayerName), txt(j.ShortName));
      personal.push([++id, nom, ap, j.BirthDate.slice(0, 10), selId.get(q.id)]);
      jugadores.push([id, POSICION[j.Position], j.JerseyNum]);
    }
    const of = [...q.plantel.Officials].sort((a, b) => a.Role - b.Role);
    for (const o of of) {
      // Se usa la variante que marca el apellido en mayúsculas ("Walter SAMUEL");
      // si ninguna lo marca, el alias ("BUBISTA") y luego el nombre completo
      const variantes = [...(o.Name || []), ...(o.Alias || [])].map(v => v.Description.trim());
      const marcada = variantes.find(v => { const m = v.split(/\s+/).map(esMayus); return m.some(Boolean) && !m.every(Boolean); });
      const alias = marcada || txt(o.Alias) || txt(o.Name);
      const [nom, ap] = separar(alias, null);
      personal.push([++id, nom, ap, o.BirthDate.slice(0, 10), selId.get(q.id)]);
      tecnicos.push([id, paisId.get(o.IdCountry), CARGO[o.Role]]);
    }
  }
  escribir('08_seed_personal_seleccion.sql', 'personal_seleccion',
    ['personal_seleccion_id', 'nombre', 'apellido', 'fecha_nacimiento', 'seleccion_id'], personal,
    'Convocatorias oficiales: jugadores ordenados por dorsal y después el cuerpo técnico de cada selección');
  escribir('09_seed_jugador.sql', 'jugador', ['personal_seleccion_id', 'posicion', 'dorsal'], jugadores);
  escribir('10_seed_cuerpo_tecnico.sql', 'cuerpo_tecnico', ['personal_seleccion_id', 'pais_id', 'cargo'], tecnicos,
    'La FIFA solo publica dos cargos: director técnico (Role 0) y auxiliar técnico (Role 1)');
})().catch(e => { console.error(e.message); process.exit(1); });
