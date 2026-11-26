INSERT INTO fase_venta (fase_venta_id, nombre, fecha_inicio, fecha_fin) VALUES
    (1, 'Sorteo preferente de Visa', '2025-09-10', '2025-09-19'),
    (2, 'Sorteo anticipado', '2025-10-27', '2025-10-31'),
    (3, 'Sorteo aleatorio', '2025-12-11', '2026-01-13'),
    (4, 'Aficionados de federaciones clasificadas de última hora', '2026-04-01', '2026-04-21'),
    (5, 'Venta de última hora', '2026-04-01', '2026-07-19');

SELECT setval(pg_get_serial_sequence('fase_venta', 'fase_venta_id'), (SELECT MAX(fase_venta_id) FROM fase_venta));
