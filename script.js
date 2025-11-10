const modal = document.getElementById("modal");
const abrirModal = document.getElementById("abrirModal");
const cerrarModal = document.getElementById("cerrarModal");
const cuerpoTabla = document.getElementById("cuerpoTabla");

abrirModal.onclick = () => modal.style.display = "block";
cerrarModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

// Cargar alumnos desde SQL Server
async function cargarAlumnos() {
  const res = await fetch("https://colegio-asis-api.onrender.com/gestor");
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
        <td>${alumno.fechaNac ? alumno.fechaNac.substring(0,10) : ''}</td>
        <td>${alumno.edad}</td>
        <td>${alumno.tutor}</td>
        <td>${alumno.salon}</td>
        <td><button class="btn-eliminar" onclick="eliminarAlumno('${alumno.codigo}')"><i class="fas fa-trash"></i></button></td>
      </tr>
    `;
  });
}

cargarAlumnos();

// Agregar alumno
document.getElementById("formAlumno").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const datos = Object.fromEntries(formData);
  await fetch("https://colegio-asis-api.onrender.com/gestor/agregar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  modal.style.display = "none";
  cargarAlumnos();
});

// Eliminar alumno
async function eliminarAlumno(codigo) {
  if (!confirm("¿Deseas eliminar este alumno?")) return;
  await fetch("https://colegio-asis-api.onrender.com/gestor/eliminar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo })
  });
  cargarAlumnos();
}

// Buscador local
document.addEventListener("DOMContentLoaded", () => {
  const inputBuscar = document.getElementById("buscar");
  const tipoBusqueda = document.getElementById("tipoBusqueda");
  const tabla = document.getElementById("tablaAlumnos");
  const filas = tabla.getElementsByTagName("tr");

  inputBuscar.addEventListener("input", function() {
    const filtro = this.value.toLowerCase();
    const tipo = tipoBusqueda.value;

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i];
      const celdas = fila.getElementsByTagName("td");
      let textoComparar = "";

      if (tipo === "dni") textoComparar = celdas[2].textContent.toLowerCase();
      else if (tipo === "apellidos") textoComparar = celdas[3].textContent.toLowerCase();

      fila.style.display = textoComparar.includes(filtro) ? "" : "none";
    }
  });
});
