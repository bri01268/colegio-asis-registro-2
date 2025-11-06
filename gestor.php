<?php
header('Content-Type: application/json');

// Datos de conexión a PostgreSQL
$host = "localhost";
$dbname = "colegio";
$user = "postgres";
$pass = "jefer290423"; // <-- reemplaza por la tuya
$port = "5432";

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {
    // 📋 LISTAR ALUMNOS
    case 'listar':
        $stmt = $conn->query("SELECT * FROM alumnos ORDER BY codigo ASC");
        $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($alumnos);
        break;

    // ➕ AGREGAR ALUMNO
    case 'agregar':
        $codigo = $_POST['codigo'];
        $dni = $_POST['dni'];
        $nombre = $_POST['nombre'];
        $sexo = $_POST['sexo'];
        $fechaNac = $_POST['fechaNac'];
        $edad = $_POST['edad'];
        $tutor = $_POST['tutor'];
        $salon = $_POST['salon'];

        $sql = "INSERT INTO alumnos (codigo, dni, nombre, sexo, fechaNac, edad, tutor, salon)
                VALUES (:codigo, :dni, :nombre, :sexo, :fechaNac, :edad, :tutor, :salon)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':codigo' => $codigo,
            ':dni' => $dni,
            ':nombre' => $nombre,
            ':sexo' => $sexo,
            ':fechaNac' => $fechaNac,
            ':edad' => $edad,
            ':tutor' => $tutor,
            ':salon' => $salon
        ]);

        echo json_encode(["mensaje" => "Alumno agregado correctamente"]);
        break;

    // ❌ ELIMINAR ALUMNO
    case 'eliminar':
        $codigo = $_POST['codigo'];
        $sql = "DELETE FROM alumnos WHERE codigo = :codigo";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':codigo' => $codigo]);
        echo json_encode(["mensaje" => "Alumno eliminado correctamente"]);
        break;

    default:
        echo json_encode(["error" => "Acción no válida"]);
        break;
}
?>
