# Mundial-FIFA-2026-
Desarrollo de la base de datos basada en el Mundial FIFA 2026 (PostgreSQL).

## Estructura

| Carpeta | Contenido |
|---|---|
| `esquema/` | `01_esquema.sql`: tipos, tablas, y al final todas las constraints (PK, UNIQUE, FK, CHECK). `02_funciones.sql`: funciones de consulta |
| `datos_semilla/` | Un script de INSERT por tabla (`01_seed_pais.sql` ... `21_seed_cronologia.sql`) y `00_cargar_todo.sql` |
| `scraper/` | `scrapear.js`: descarga los datos de la API pública de la FIFA y regenera los seeds |

## Uso

```bash
createdb -U postgres mundial
psql -U postgres -d mundial -v ON_ERROR_STOP=1 -f datos_semilla/00_cargar_todo.sql
```

Cronología de un partido como en el sitio de la FIFA (del evento más reciente al más antiguo):

```sql
SELECT * FROM cronologia_partido(104);
```

Para regenerar los seeds (Node 18 o superior):

```bash
node scraper/scrapear.js
```

## Fuentes

- Selecciones, grupos, convocatorias, cuerpo técnico, estadios y ciudades: API de la FIFA (`api.fifa.com/api/v3`, competición 17, temporada 285023).
- Tipos de evento y roles de árbitro: cronologías y árbitros de los 104 partidos en la API de la FIFA.
- Partidos: calendario de la API de la FIFA (fecha y hora programada en hora local del estadio, asistencia, selecciones, formaciones, estadio y ronda); la hora de término es el evento "Final de partido" de cada cronología. `partido_id` es el número de partido de la FIFA (M1 a M104). Posesión del balón: FIFA Data Hub (`fdh-api.fifa.com`).
- Cronología: los 9,675 eventos de las cronologías de los 104 partidos en la API de la FIFA.
- Niveles de hospitalidad, versiones, amenidades, paquetes, categorías de boleto y fases de venta (`scraper/fuentes/catalogos.json`, scrapeado con navegador): sitio oficial de hospitalidad de On Location (copia archivada), soporte oficial de boletos de la FIFA y worldcupwiki.com.
- Estadios (`scraper/fuentes/estadios.json`, scrapeado con navegador): capacidad FIFA de la nota oficial del 10 de junio de 2026 (inside.fifa.com); nombre real y capacidad permanente de Wikipedia; dirección de Wikipedia/Wikidata y OpenStreetMap.
