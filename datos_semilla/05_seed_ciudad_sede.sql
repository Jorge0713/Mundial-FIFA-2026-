INSERT INTO ciudad_sede (ciudad_sede_id, nombre, pais_id) VALUES
    (1, 'Área de la Bahía de San Francisco', 21),
    (2, 'Atlanta', 21),
    (3, 'Boston', 21),
    (4, 'Ciudad de México', 38),
    (5, 'Dallas', 21),
    (6, 'Filadelfia', 21),
    (7, 'Guadalajara', 38),
    (8, 'Houston', 21),
    (9, 'Kansas City', 21),
    (10, 'Los Ángeles', 21),
    (11, 'Miami', 21),
    (12, 'Monterrey', 38),
    (13, 'Nueva Jersey', 21),
    (14, 'Seattle', 21),
    (15, 'Toronto', 12),
    (16, 'Vancouver', 12);

SELECT setval(pg_get_serial_sequence('ciudad_sede', 'ciudad_sede_id'), (SELECT MAX(ciudad_sede_id) FROM ciudad_sede));
