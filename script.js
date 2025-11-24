console.log("SCRIPT JS CARGADO!");
const API = "http://localhost:3000";

const modal = document.getElementById("modal");
const abrirModal = document.getElementById("abrirModal");
const cerrarModal = document.getElementById("cerrarModal");
const cuerpoTabla = document.getElementById("cuerpoTabla");

abrirModal.onclick = () => modal.style.display = "block";
cerrarModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

// ===============================
// Cargar alumnos desde API
// ===============================
async function cargarAlumnos() {
  const res = await fetch(`${API}/gestor`);
  const data = await res.json();
  cuerpoTabla.innerHTML = "";

  data.forEach((alumno, i) => {
    cuerpoTabla.innerHTML += `
      <tr>
        <td>${alumno.N}</td>
        <td>${alumno.codigo}</td>
        <td>${alumno.dni}</td>
        <td>${alumno.apellidos_nombres}</td>
        <td>${alumno.sexo}</td>
        <td>${alumno.fecha_nacimiento ? alumno.fecha_nacimiento.substring(0,10) : ""}</td>
        <td>${alumno.edad}</td>
        <td>${alumno.tutor}</td>
        <td>${alumno.salon}</td>
        <td><button class="btn-eliminar" onclick="eliminarAlumno('${alumno.dni}')"><i class="fas fa-trash"></i></button></td>
      </tr>
    `;
  });
}

cargarAlumnos();

// ===============================
// AGREGAR ALUMNO
// ===============================
document.getElementById("formAlumno").addEventListener("submit", async e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target));

  // Renombramos para coincidir con SQL
  datos.apellidos_nombres = datos.apellidos_nombres || datos.nombre;
  datos.fecha_nacimiento = datos.fechaNac;

  delete datos.nombre;
  delete datos.fechaNac;

  await fetch(`${API}/gestor/agregar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  modal.style.display = "none";
  cargarAlumnos();
});

// ===============================
// ELIMINAR ALUMNO
// ===============================
async function eliminarAlumno(dni) {
  if (!confirm("¿Deseas eliminar este alumno?")) return;

  await fetch(`${API}/gestor/eliminar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dni })
  });

  cargarAlumnos();
}

// ===============================
// BUSCADOR LOCAL
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const inputBuscar = document.getElementById("buscar");
  const tipoBusqueda = document.getElementById("tipoBusqueda");

  inputBuscar.addEventListener("input", () => {
    const filtro = inputBuscar.value.toLowerCase();
    const tipo = tipoBusqueda.value;
    const filas = document.querySelectorAll("#tablaAlumnos tbody tr");

    filas.forEach(fila => {
      const dni = fila.children[2].textContent.toLowerCase();
      const nombre = fila.children[3].textContent.toLowerCase();

      const coincide = tipo === "dni" ? dni.includes(filtro) : nombre.includes(filtro);
      fila.style.display = coincide ? "" : "none";
    });
  });
});
