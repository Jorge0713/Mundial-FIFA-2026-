INSERT INTO rol (rol_id, nombre) VALUES
    (1, 'Árbitro'),
    (2, 'Primer árbitro asistente'),
    (3, 'Segundo árbitro asistente'),
    (4, 'Cuarto árbitro'),
    (5, 'Árbitro asistente de video (VAR)'),
    (6, 'Árbitro de reserva'),
    (7, 'Asistente del VAR'),
    (8, 'Asistente de apoyo');

SELECT setval(pg_get_serial_sequence('rol', 'rol_id'), (SELECT MAX(rol_id) FROM rol));
