INSERT INTO ciudad_sede (ciudad_sede_id, nombre, pais_id) VALUES
    (1, 'Área de la Bahía de San Francisco', 18),
    (2, 'Atlanta', 18),
    (3, 'Boston', 18),
    (4, 'Ciudad de México', 32),
    (5, 'Dallas', 18),
    (6, 'Filadelfia', 18),
    (7, 'Guadalajara', 32),
    (8, 'Houston', 18),
    (9, 'Kansas City', 18),
    (10, 'Los Ángeles', 18),
    (11, 'Miami', 18),
    (12, 'Monterrey', 32),
    (13, 'Nueva Jersey', 18),
    (14, 'Seattle', 18),
    (15, 'Toronto', 11),
    (16, 'Vancouver', 11);

SELECT setval(pg_get_serial_sequence('ciudad_sede', 'ciudad_sede_id'), (SELECT MAX(ciudad_sede_id) FROM ciudad_sede));
