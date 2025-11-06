const modal = document.getElementById("modal");
    const abrirModal = document.getElementById("abrirModal");
    const cerrarModal = document.getElementById("cerrarModal");
    const cuerpoTabla = document.getElementById("cuerpoTabla");

    abrirModal.onclick = () => modal.style.display = "block";
    cerrarModal.onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

    // Cargar alumnos del CSV
    async function cargarAlumnos() {
      const res = await fetch("gestor.php?accion=listar");
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
            <td>${alumno.fechaNac}</td>
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
      formData.append("accion", "agregar");
      await fetch("gestor.php", { method: "POST", body: formData });
      modal.style.display = "none";
      cargarAlumnos();
    });

    // Eliminar alumno
    async function eliminarAlumno(codigo) {
      if (!confirm("¿Deseas eliminar este alumno?")) return;
      const formData = new FormData();
      formData.append("accion", "eliminar");
      formData.append("codigo", codigo);
      await fetch("gestor.php", { method: "POST", body: formData });
      cargarAlumnos();
    }

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

      if (tipo === "dni") textoComparar = celdas[2].textContent.toLowerCase();       // Columna DNI
      else if (tipo === "apellidos") textoComparar = celdas[3].textContent.toLowerCase(); // Columna Apellidos

      fila.style.display = textoComparar.includes(filtro) ? "" : "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const tipoBusqueda = document.getElementById("tipoBusqueda");
  const inputBuscar = document.getElementById("buscar");

  // Actualizar el placeholder según la opción seleccionada
  tipoBusqueda.addEventListener("change", () => {
    if (tipoBusqueda.value === "dni") {
      inputBuscar.placeholder = "Buscar por DNI...";
    } else if (tipoBusqueda.value === "apellidos") {
      inputBuscar.placeholder = "Buscar alumno...";
    }
  });
});
