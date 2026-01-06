const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
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
    "http://localhost:3001",
    "https://bri01268.github.io",
    "https://bri01268.github.io/colegio-asis-registro-2"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ⚙️ Configuración Azure SQL
const dbConfig = {
  user: "adminsql",              // ej: adminsql
  password: "Jefer290423@",          // tu clave
  server: "jeryroldan.database.windows.net",          // ej: mi-sql-server.database.windows.net
  database: "alumnosdb",          // ej: alumnosdb
  options: {
    encrypt: true,                        // Azure requiere encrypt
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
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
// 🔹 AGREGAR alumno
app.post("/gestor/agregar", async (req, res) => {
  const {
    codigo,
    dni,
    apellidos_nombres,
    sexo,
    fecha_nacimiento,
    edad,
    tutor,
    salon,
    fecha_registro,
    motivo_derivacion
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("codigo", sql.VarChar, codigo)
      .input("dni", sql.VarChar, dni)
      .input("apellidos_nombres", sql.VarChar, apellidos_nombres)
      .input("sexo", sql.VarChar, sexo)
      .input("fecha_nacimiento", sql.Date, fecha_nacimiento)
      .input("edad", sql.Int, edad)
      .input("tutor", sql.VarChar, tutor)
      .input("salon", sql.VarChar, salon)
      .input("fecha_registro", sql.Date, fecha_registro)
      .input("motivo_derivacion", sql.VarChar, motivo_derivacion)
      .query(`
        INSERT INTO dbo.Alumnos (
          codigo, dni, apellidos_nombres, sexo, fecha_nacimiento, edad, tutor, salon,
          fecha_registro, motivo_derivacion
        )
        VALUES (
          @codigo, @dni, @apellidos_nombres, @sexo, @fecha_nacimiento, @edad, @tutor, @salon,
          @fecha_registro, @motivo_derivacion
        )
      `);

    res.json({ status: "ok", mensaje: "Alumno agregado correctamente" });

  } catch (err) {
    console.error("Error al agregar:", err);
    return res.status(500).json({ error: true, mensaje: "No se pudo agregar el alumno" });
  }
});


// 🔹 ELIMINAR alumno
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
  return res.status(500).json({ error: true, mensaje: "No se pudo eliminar el alumno" });
}

});

// 🔹 ACTUALIZAR CAMPO EN LINEA
app.put("/gestor/actualizar", async (req, res) => {
  const { dni, campo, valor } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("valor", sql.VarChar, valor)
      .input("dni", sql.VarChar, dni)
      .query(`
        UPDATE dbo.Alumnos
        SET ${campo} = @valor
        WHERE dni = @dni
      `);

    res.json({ status: "ok" });

  } catch (err) {
    console.error("Error al actualizar:", err);
    res.status(500).json({ error: true });
  }
});


// 🔹 BUSCAR alumno
app.get("/gestor/buscar", async (req, res) => {
  const { tipo, valor } = req.query;
  const columna = tipo === "dni" ? "dni" : "apellidos_nombres";

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("valor", sql.VarChar, `%${valor}%`)
      .query(`
        SELECT 
          N,
          codigo,
          dni,
          apellidos_nombres,
          sexo,
          fecha_nacimiento,
          edad,
          tutor,
          salon
        FROM dbo.Alumnos
        WHERE ${columna} LIKE @valor
      `);
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
const PORT = process.env.PORT || 3200;

const server = app.listen(PORT, () => {
  console.log("API corriendo en puerto", PORT);
});

server.on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.log("⚠️ Puerto 3000 ocupado, usando 3200...");
    app.listen(3001, () => console.log("API corriendo en puerto 3200"));
  }
});

let poolPromise = sql.connect(dbConfig).then(pool => {
  console.log("Conectado a SQL Server");
  return pool;
}).catch(err => {
  console.log("Error al conectar a SQL Server", err);
});
