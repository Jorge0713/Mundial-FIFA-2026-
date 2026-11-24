# Mundial-FIFA-2026-
Desarrollo de la base de datos basada en el Mundial FIFA 2026 (PostgreSQL).

## Estructura

| Carpeta | Contenido |
|---|---|
| `esquema/` | `01_esquema.sql`: tipos, tablas, y al final todas las constraints (PK, UNIQUE, FK, CHECK) y los triggers |
| `datos_semilla/` | Un script de INSERT por tabla (`01_seed_confederacion.sql` ... `10_seed_cuerpo_tecnico.sql`) y `00_cargar_todo.sql` |
| `scraper/` | `scrapear.js`: descarga los datos de la API pública de la FIFA y regenera los seeds |

## Uso

```bash
createdb -U postgres mundial
psql -U postgres -d mundial -v ON_ERROR_STOP=1 -f datos_semilla/00_cargar_todo.sql
```

Para regenerar los seeds (Node 18 o superior):

```bash
node scraper/scrapear.js
```

## Fuentes

- Selecciones, grupos, convocatorias, cuerpo técnico, estadios y ciudades: API de la FIFA (`api.fifa.com/api/v3`, competición 17, temporada 285023).
- Estadios (`scraper/fuentes/estadios.json`, scrapeado con navegador): capacidad FIFA de la nota oficial del 10 de junio de 2026 (inside.fifa.com); nombre real y capacidad permanente de Wikipedia; dirección de Wikipedia/Wikidata y OpenStreetMap.
