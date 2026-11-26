INSERT INTO paquete (paquete_id, nombre, descripcion) VALUES
    (1, 'Partido individual', 'Un partido a elegir de fase de grupos o eliminatoria, excepto la final.'),
    (2, 'Serie de sede', 'Todos los partidos de un mismo estadio, de 4 a 9 según la sede.'),
    (3, 'Sigue a tu selección', 'Los partidos de una selección no anfitriona en la primera fase, en cualquier sede.'),
    (4, 'Serie multipartido', 'De 4 a 5 partidos elegidos por etapas; da acceso a partidos de Estados Unidos y a la final.'),
    (5, 'Camino a la final', 'Las dos semifinales y la final.'),
    (6, 'Suite privada', 'Suite para el grupo con entrada preferente, acceso directo al asiento y servicio dedicado.'),
    (7, 'Platinum Access', 'La oferta más exclusiva, personalizada y solo por solicitud.');

SELECT setval(pg_get_serial_sequence('paquete', 'paquete_id'), (SELECT MAX(paquete_id) FROM paquete));
