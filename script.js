const API = "https://colegio-asis-api.onrender.com";

const modal = document.getElementById("modal");
const abrirModal = document.getElementById("abrirModal");
const cerrarModal = document.getElementById("cerrarModal");
const cuerpoTabla = document.getElementById("cuerpoTabla");

abrirModal.onclick = () => modal.style.display = "block";
cerrarModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

// ===============================
// Cargar alumnos desde API Render
// ===============================
async function cargarAlumnos() {
  const res = await fetch(`${API}/gestor`);
  const data = await res.json();
  cuerpoTabla.innerHTML = "";

  data.forEach((alumno, i) => {
    cuerpoTabla.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${alumno.codigo}</td>
        <td>${alumno.dni}</td>
        <td>${alumno.nombre}</td>
        <td>${alumno.sexo}</td>
        <td>${alumno.fechaNac ? alumno.fechaNac.substring(0,10) : ""}</td>
        <td>${alumno.edad}</td>
        <td>${alumno.tutor}</td>
        <td>${alumno.salon}</td>
        <td><button class="btn-eliminar" onclick="eliminarAlumno('${alumno.codigo}')"><i class="fas fa-trash"></i></button></td>
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
async function eliminarAlumno(codigo) {
  if (!confirm("¿Deseas eliminar este alumno?")) return;

  await fetch(`${API}/gestor/eliminar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo })
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
