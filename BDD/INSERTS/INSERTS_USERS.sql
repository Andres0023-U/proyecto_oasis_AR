
INSERT INTO oasis.users (
    id_rol,
    documento,
    nombre,
    apellido,
    correo,
    telefono,
    password_hash
) VALUES
(1, '1001001001', 'Carlos', 'Ramirez', 'carlos@gmail.com', '3001112233', 'hash_admin'),

(2, '1001001002', 'Laura', 'Martinez', 'laura@gmail.com', '3002223344', 'hash_empleado'),

(3, '1001001003', 'Andres', 'Lopez', 'andres@gmail.com', '3003334455', 'hash_cliente1'),

(3, '1001001004', 'Sofia', 'Garcia', 'sofia@gmail.com', '3004445566', 'hash_cliente2');