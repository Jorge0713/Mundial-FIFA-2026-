INSERT INTO nivel (nivel_id, nombre, descripcion) VALUES
    (1, 'Pitchside Lounge', 'Salón a nivel de cancha con los asientos más cercanos al campo; el nivel compartido más alto.'),
    (2, 'VIP', 'Salón de lujo con asientos laterales preferentes y vista privilegiada del partido.'),
    (3, 'Trophy Lounge', 'Salón elevado con muy buena vista, gastronomía de alto nivel y servicio premium.'),
    (4, 'Champions Club', 'Asientos junto a las áreas de hospitalidad, con acceso cercano a las amenidades premium.'),
    (5, 'FIFA Pavilion', 'Pabellón exclusivo junto al estadio, dentro del perímetro de seguridad; nivel de entrada.');

SELECT setval(pg_get_serial_sequence('nivel', 'nivel_id'), (SELECT MAX(nivel_id) FROM nivel));
