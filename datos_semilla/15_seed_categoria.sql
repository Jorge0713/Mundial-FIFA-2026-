INSERT INTO categoria (categoria_id, nombre, descripcion) VALUES
    (1, 'Categoría 1', 'Los boletos más caros, en las zonas preferentes de la grada inferior.'),
    (2, 'Categoría 2', 'Fuera de la categoría 1, en grada inferior y superior.'),
    (3, 'Categoría 3', 'Fuera de las categorías 1 y 2, generalmente en grada superior.'),
    (4, 'Categoría 4', 'La más económica, fuera de las categorías 1 a 3, en grada superior.'),
    (5, 'Accesibilidad', 'Zona para personas con discapacidad y movilidad reducida.'),
    (6, 'Aficionados sección referente', 'Boleto de aficionado de selección, la zona más cercana al campo.'),
    (7, 'Aficionados sección estándar', 'Boleto de aficionado de selección, detrás de la sección referente.'),
    (8, 'Aficionados sección económica', 'Boleto de aficionado de selección, detrás de la sección estándar.'),
    (9, 'Aficionados grada básica', 'Boleto de aficionado asignado directamente por cada federación.');

SELECT setval(pg_get_serial_sequence('categoria', 'categoria_id'), (SELECT MAX(categoria_id) FROM categoria));
