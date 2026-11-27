DROP FUNCTION IF EXISTS cronologia_partido(integer);

CREATE FUNCTION cronologia_partido(p_partido_id integer)
RETURNS TABLE (
    minuto     text,
    evento     varchar,
    detalle    text,
    seleccion  varchar
)
LANGUAGE sql STABLE
AS $$
    SELECT
        c.minuto || '''' || coalesce('+' || c.tiempo_agregado || '''', ''),
        e.nombre,
        CASE
            WHEN e.nombre = 'Sustitución'
                THEN concat_ws(' ', pe.nombre, pe.apellido) || ' entra por ' || concat_ws(' ', ps.nombre, ps.apellido)
            ELSE concat_ws(' ', pe.nombre, pe.apellido)
        END,
        s.nombre
    FROM cronologia c
    JOIN evento e ON e.evento_id = c.evento_id
    LEFT JOIN personal_seleccion pe ON pe.personal_seleccion_id = c.entra_id
    LEFT JOIN personal_seleccion ps ON ps.personal_seleccion_id = c.sale_id
    LEFT JOIN seleccion s ON s.seleccion_id = pe.seleccion_id
    WHERE c.partido_id = p_partido_id
    ORDER BY c.cronologia_id DESC;
$$;
