INSERT INTO grupo (grupo_id, nombre) VALUES
    (1, 'A'),
    (2, 'B'),
    (3, 'C'),
    (4, 'D'),
    (5, 'E'),
    (6, 'F'),
    (7, 'G'),
    (8, 'H'),
    (9, 'I'),
    (10, 'J'),
    (11, 'K'),
    (12, 'L');

SELECT setval(pg_get_serial_sequence('grupo', 'grupo_id'), (SELECT MAX(grupo_id) FROM grupo));
