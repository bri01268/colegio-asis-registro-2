const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ⚙️ Configuración de conexión (Render + Azure SQL)
const dbConfig = {
  user: process.env.DB_USER || "jeryroldan",       // usuario de Azure
  password: process.env.DB_PASS || "jefer290423@", // contraseña segura
  server: process.env.DB_SERVER || "colegio-asis.database.windows.net", // servidor Azure
  database: process.env.DB_NAME || "alumnosdb",
  options: {
    encrypt: true,                 // obligatorio en Azure
    trustServerCertificate: false, // mantener en false
  },
};

// 🔹 LISTAR todos los alumnos
app.get("/gestor", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM dbo.Alumnos");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al listar:", err);
    res.status(500).send("Error al obtener alumnos");
  }
});

// 🔹 AGREGAR alumno
app.post("/gestor/agregar", async (req, res) => {
  const { codigo, dni, nombre, sexo, fechaNac, edad, tutor, salon } = req.body;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("codigo", sql.VarChar, codigo)
      .input("dni", sql.VarChar, dni)
      .input("nombre", sql.VarChar, nombre)
      .input("sexo", sql.VarChar, sexo)
      .input("fechaNac", sql.Date, fechaNac)
      .input("edad", sql.Int, edad)
      .input("tutor", sql.VarChar, tutor)
      .input("salon", sql.VarChar, salon)
      .query(`INSERT INTO dbo.Alumnos (codigo, dni, nombre, sexo, fechaNac, edad, tutor, salon)
              VALUES (@codigo, @dni, @nombre, @sexo, @fechaNac, @edad, @tutor, @salon)`);
    res.send("✅ Alumno agregado correctamente");
  } catch (err) {
    console.error("Error al agregar:", err);
    res.status(500).send("Error al agregar alumno");
  }
});

// 🔹 ELIMINAR alumno
app.post("/gestor/eliminar", async (req, res) => {
  const { codigo } = req.body;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("codigo", sql.VarChar, codigo)
      .query("DELETE FROM dbo.Alumnos WHERE codigo = @codigo");
    res.send("🗑️ Alumno eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).send("Error al eliminar alumno");
  }
});

// 🔹 BUSCAR alumno
app.get("/gestor/buscar", async (req, res) => {
  const { tipo, valor } = req.query;
  const columna = tipo === "dni" ? "dni" : "nombre";
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("valor", sql.VarChar, `%${valor}%`)
      .query(`SELECT * FROM dbo.Alumnos WHERE ${columna} LIKE @valor`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al buscar:", err);
    res.status(500).send("Error en la búsqueda");
  }
});
app.get("/", (req, res) => {
  res.send(`
    <h2>✅ API Colegio Asís corriendo correctamente</h2>
    <p>Usa las rutas:</p>
    <ul>
      <li><a href="/gestor">/gestor</a> → Listar alumnos</li>
      <li>POST /gestor/agregar → Agregar alumno</li>
      <li>POST /gestor/eliminar → Eliminar alumno</li>
      <li>GET /gestor/buscar?tipo=dni&valor=123 → Buscar alumno</li>
    </ul>
  `);
});


// 🔹 Servidor en Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor Node.js corriendo en puerto ${PORT}`));
