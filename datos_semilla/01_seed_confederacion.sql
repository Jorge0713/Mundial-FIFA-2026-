INSERT INTO confederacion (confederacion_id, siglas, nombre) VALUES
    (1, 'CAF', 'Confederación Africana de Fútbol'),
    (2, 'CONCACAF', 'Confederación de Fútbol de Norteamérica, Centroamérica y el Caribe'),
    (3, 'CONMEBOL', 'Confederación Sudamericana de Fútbol'),
    (4, 'OFC', 'Confederación de Fútbol de Oceanía'),
    (5, 'AFC', 'Confederación Asiática de Fútbol'),
    (6, 'UEFA', 'Confederación Europea de Fútbol');

SELECT setval(pg_get_serial_sequence('confederacion', 'confederacion_id'), (SELECT MAX(confederacion_id) FROM confederacion));
