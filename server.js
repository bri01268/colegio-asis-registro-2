const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ==========================
//  CORS
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

// ==========================
//  CONFIG SQL SERVER LOCAL
// ==========================
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

// ==========================
//  ➤ LISTAR TODOS LOS ALUMNOS
// ==========================
app.get("/gestor", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM dbo.Alumnos ORDER BY apellidos_nombres");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al listar:", err);
    res.status(500).send("Error al obtener alumnos");
  }
});

// ==========================
//  ➤ AGREGAR ALUMNO
// ==========================
app.post("/gestor/agregar", async (req, res) => {
  const {
    N, codigo, dni, apellidos_nombres, sexo,
    fecha_nacimiento, edad, tutor, salon
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("N", sql.Int, N)
      .input("codigo", sql.VarChar, codigo)
      .input("dni", sql.VarChar, dni)
      .input("apellidos_nombres", sql.VarChar, apellidos_nombres)
      .input("sexo", sql.VarChar, sexo)
      .input("fecha_nacimiento", sql.Date, fecha_nacimiento)
      .input("edad", sql.Int, edad)
      .input("tutor", sql.VarChar, tutor)
      .input("salon", sql.VarChar, salon)
      .query(`
        INSERT INTO dbo.Alumnos 
        (N, codigo, dni, apellidos_nombres, sexo, fecha_nacimiento, edad, tutor, salon)
        VALUES (@N, @codigo, @dni, @apellidos_nombres, @sexo, @fecha_nacimiento, @edad, @tutor, @salon)
      `);

    res.send("✅ Alumno agregado correctamente");
  } catch (err) {
    console.error("Error al agregar:", err);
    res.status(500).send("Error al agregar alumno");
  }
});

// ==========================
//  ➤ ELIMINAR ALUMNO POR DNI
// ==========================
app.post("/gestor/eliminar", async (req, res) => {
  const { dni } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("dni", sql.VarChar, dni)
      .query("DELETE FROM dbo.Alumnos WHERE dni = @dni");

    res.send("🗑️ Alumno eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).send("Error al eliminar alumno");
  }
});

// ==========================
//  ➤ BUSCAR ALUMNO POR DNI O APELLIDOS
// ==========================
app.get("/gestor/buscar", async (req, res) => {
  const { tipo, valor } = req.query;

  // tipo = "dni" → busca por DNI
  // tipo = "apellidos" → busca por apellidos_nombres
  const columna = tipo === "dni" ? "dni" : "apellidos_nombres";

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

// ==========================
//  ➤ PÁGINA DE PRUEBA
// ==========================
app.get("/", (req, res) => {
  res.send(`
    <h2>API Colegio Asís funcionando correctamente ✔</h2>
    <p>Rutas disponibles:</p>
    <ul>
      <li><a href="/gestor">GET /gestor</a> → Listar alumnos</li>
      <li>POST /gestor/agregar → Crear alumno</li>
      <li>POST /gestor/eliminar → Eliminar alumno por DNI</li>
      <li>GET /gestor/buscar?tipo=dni&valor=8238 → Buscar</li>
    </ul>
  `);
});

// ==========================
//  SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
