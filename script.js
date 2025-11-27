console.log("SCRIPT JS CARGADO!");
const API = "http://localhost:3001";

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
      <tr onclick="seleccionarFila(this, '${alumno.dni}')">
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

  // Renombrar correctamente
  datos.fecha_nacimiento = datos.fechaNac;
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

let dniSeleccionado = null;
let filaSeleccionada = null;

function seleccionarFila(fila, dni) {
  if (filaSeleccionada) {
    filaSeleccionada.classList.remove("fila-seleccionada");
  }

  filaSeleccionada = fila;
  filaSeleccionada.classList.add("fila-seleccionada");
  dniSeleccionado = dni;
}

document.getElementById("eliminarRegistro").addEventListener("click", async () => {
  if (!dniSeleccionado) {
    alert("⚠️ Seleccione un alumno de la tabla primero");
    return;
  }

  if (!confirm(`¿Seguro que deseas eliminar al alumno con DNI: ${dniSeleccionado}?`)) {
    return;
  }

  await eliminarAlumno(dniSeleccionado);
  dniSeleccionado = null;
  cargarAlumnos();
});

// ===== FUNCIONES DE PANTALLAS =====
function mostrarContenido() {
  document.getElementById("login").style.display = "none";
  document.getElementById("contenido").style.display = "block";
}

function mostrarLogin() {
  document.getElementById("login").style.display = "flex";
  document.getElementById("contenido").style.display = "none";
}

// ===== AL CARGAR LA PÁGINA =====
document.addEventListener("DOMContentLoaded", () => {
  const logueado = localStorage.getItem("logueado");

  if (logueado === "true") {
    mostrarContenido();
  } else {
    mostrarLogin();
  }
});

// ===== BOTÓN LOGIN =====
document.getElementById("btnLogin").addEventListener("click", () => {
  const user = document.getElementById("usuario").value.trim();
  const pass = document.getElementById("clave").value.trim();

  // Credenciales
  if (user === "admin" && pass === "admin") {
    localStorage.setItem("logueado", "true");
    mostrarContenido();
  } else {
    document.getElementById("errorLogin").innerText = "Usuario o contraseña incorrectos";
  }
});

// ===== BOTÓN CERRAR SESIÓN =====
const btnLogout = document.createElement("button");
btnLogout.innerText = "Cerrar Sesión";
btnLogout.classList.add("btn-cerrar-sesion");
btnLogout.style.marginLeft = "auto";
btnLogout.onclick = () => {
  localStorage.removeItem("logueado");
  mostrarLogin();
};
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".encabezado").appendChild(btnLogout);
});

// ===== SEGURIDAD EXTRA =====
window.addEventListener("beforeunload", () => {
  const logueado = localStorage.getItem("logueado");
  if (logueado !== "true") {
    mostrarLogin();
  }
});

