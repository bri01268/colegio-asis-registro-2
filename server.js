const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// ==========================
//  CORS (DEBE IR AQUÍ)
// ==========================
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5501",
    "http://localhost:5500",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://bri01268.github.io",
    "https://bri01268.github.io/colegio-asis-registro-2"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ⚙️ Configuración SQL Server LOCAL
const dbConfig = {
  user: "sa",
  password: "jefer290423",
  server: "DESKTOP-6HNM4F3",
  database: "alumnosdb",
  options: {
    encrypt: false,
    trustServerCertificate: true,
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

// Página raíz de prueba
app.get("/", (req, res) => {
  res.send(`
    <h2>API Colegio Asís corriendo correctamente</h2>
    <p>Usa las rutas:</p>
    <ul>
      <li><a href="/gestor">/gestor</a> → Listar alumnos</li>
      <li>POST /gestor/agregar → Agregar alumno</li>
      <li>POST /gestor/eliminar → Eliminar alumno</li>
      <li>GET /gestor/buscar?tipo=dni&valor=123 → Buscar alumno</li>
    </ul>
  `);
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
