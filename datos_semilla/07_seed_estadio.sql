INSERT INTO estadio (estadio_id, nombre, nombre_fifa, capacidad, capacidad_fifa, direccion, municipio, estado, codigo_postal, ciudad_sede_id) VALUES
    (1, 'Mercedes-Benz Stadium', 'Estadio Atlanta', 71000, 68239, '1 AMB Drive Northwest', 'Atlanta', 'Georgia', '30313', 2),
    (2, 'BC Place', 'Estadio BC Place Vancouver', 54500, 52497, '777 Pacific Boulevard, Downtown', 'Vancouver', 'Columbia Británica', 'V6B 4Y8', 16),
    (3, 'Gillette Stadium', 'Estadio Boston', 64628, 64146, '1 Patriot Place', 'Foxborough', 'Massachusetts', '02035', 3),
    (4, 'Estadio Banorte', 'Estadio Ciudad de México', 87523, 80824, 'Calzada de Tlalpan 3465, Santa Úrsula Coapa', 'Coyoacán', 'Ciudad de México', '04600', 4),
    (5, 'AT&T Stadium', 'Estadio Dallas', 80000, 70649, '1 AT&T Way', 'Arlington', 'Texas', '76011', 5),
    (6, 'Levi''s Stadium', 'Estadio de la Bahía de San Francisco', 68500, 68827, '4900 Marie P. DeBartolo Way', 'Santa Clara', 'California', '95054', 1),
    (7, 'Lumen Field', 'Estadio de Seattle', 68740, 66925, '800 Occidental Avenue South', 'Seattle', 'Washington', '98134', 14),
    (8, 'BMO Field', 'Estadio de Toronto', 28351, 43036, '170 Princes'' Boulevard, Fort York-Liberty Village', 'Toronto', 'Ontario', 'M6K 3C3', 15),
    (9, 'Lincoln Financial Field', 'Estadio Filadelfia', 67594, 68324, '1020 Pattison Avenue, South Philadelphia', 'Filadelfia', 'Pensilvania', '19148', 6),
    (10, 'Estadio Akron', 'Estadio Guadalajara', 49813, 45664, 'Circuito JVC 2800, San Juan de Ocotán', 'Zapopan', 'Jalisco', '45019', 7),
    (11, 'Reliant Stadium', 'Estadio Houston', 72220, 68777, '1 Reliant Parkway', 'Houston', 'Texas', '77054', 8),
    (12, 'Arrowhead Stadium', 'Estadio Kansas City', 76416, 69045, '1 Arrowhead Drive', 'Kansas City', 'Misuri', '64129', 9),
    (13, 'SoFi Stadium', 'Estadio Los Angeles', 70240, 70492, '1001 South Stadium Drive, Hollywood Park', 'Inglewood', 'California', '90301', 10),
    (14, 'Hard Rock Stadium', 'Estadio Miami', 64767, 64478, '347 Don Shula Drive', 'Miami Gardens', 'Florida', '33056', 11),
    (15, 'Estadio BBVA', 'Estadio Monterrey', 53529, 51243, 'Avenida Pablo Livas 2011, La Pastora', 'Guadalupe', 'Nuevo León', '67140', 12),
    (16, 'MetLife Stadium', 'Estadio Nueva York/Nueva Jersey', 82500, 80663, '1 MetLife Stadium Drive', 'East Rutherford', 'Nueva Jersey', '07073', 13);

SELECT setval(pg_get_serial_sequence('estadio', 'estadio_id'), (SELECT MAX(estadio_id) FROM estadio));
