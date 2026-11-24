INSERT INTO ronda (ronda_id, nombre, orden, es_eliminatoria) VALUES
    (1, 'Fase de grupos', 1, false),
    (2, 'Dieciseisavos de final', 2, true),
    (3, 'Octavos de final', 3, true),
    (4, 'Cuartos de final', 4, true),
    (5, 'Semifinales', 5, true),
    (6, 'Partido por el tercer lugar', 6, true),
    (7, 'Final', 7, true);

SELECT setval(pg_get_serial_sequence('ronda', 'ronda_id'), (SELECT MAX(ronda_id) FROM ronda));
