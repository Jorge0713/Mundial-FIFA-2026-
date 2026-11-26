INSERT INTO amenidad (amenidad_id, nombre) VALUES
    (1, 'Asiento preferente'),
    (2, 'Salón climatizado'),
    (3, 'Comida regional de chefs locales'),
    (4, 'Bebidas ilimitadas con y sin alcohol'),
    (5, 'Filtro de seguridad exclusivo'),
    (6, 'Concierge en el estadio'),
    (7, 'Regalo conmemorativo oficial'),
    (8, 'Estaciones de cocina en vivo'),
    (9, 'Servicio de bebidas guiado por sumiller'),
    (10, 'Estaciones de menú temático'),
    (11, 'Menú de chef con ingredientes locales'),
    (12, 'Comida callejera regional'),
    (13, 'Programación antes y después del partido'),
    (14, 'Entretenimiento en vivo'),
    (15, 'Visita de exjugadores'),
    (16, 'Menú halal y kosher a solicitud');

SELECT setval(pg_get_serial_sequence('amenidad', 'amenidad_id'), (SELECT MAX(amenidad_id) FROM amenidad));
