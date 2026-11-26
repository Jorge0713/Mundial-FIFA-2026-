INSERT INTO evento (evento_id, nombre) VALUES
    (1, 'Gol'),
    (2, 'Gol en propia puerta'),
    (3, 'Gol de penal'),
    (4, 'Penal señalado'),
    (5, 'Penal fallado'),
    (6, 'Tarjeta amarilla'),
    (7, 'Segunda tarjeta amarilla'),
    (8, 'Tarjeta roja'),
    (9, 'Sustitución'),
    (10, 'Remate a puerta'),
    (11, 'Parada'),
    (12, 'Fuera de juego'),
    (13, 'Saque de esquina'),
    (14, 'Falta'),
    (15, 'Revisión del VAR');

SELECT setval(pg_get_serial_sequence('evento', 'evento_id'), (SELECT MAX(evento_id) FROM evento));
