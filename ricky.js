const API = "https://rickandmortyapi.com/api";
const galeria = document.getElementById("galeria");
const mensaje = document.getElementById("mensaje");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const paginaTexto = document.getElementById("paginaTexto");
const modal = new bootstrap.Modal(document.getElementById("modalDetalle"));

let pagina = 1;
let totalPaginas = 42;

function mostrarError(texto) {
  mensaje.innerHTML = `<div class="alert alert-danger" role="alert">${texto}</div>`;
}

function claseEstado(status) {
  const s = status.toLowerCase();
  return s === "alive" ? "alive" : s === "dead" ? "dead" : "unknown";
}

function formatearFecha(iso) {
  const f = new Date(iso);
  const dd = String(f.getUTCDate()).padStart(2, "0");
  const mm = String(f.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${f.getUTCFullYear()}`;
}

function tarjeta(p) {
  return `
    <div class="col">
      <div class="card card-personaje h-100 rounded-3">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h2 class="card-title h6 fw-bold">${p.name}</h2>
          <p class="small mb-2"><span class="punto ${claseEstado(p.status)}"></span>${p.status} - ${p.species}</p>
          <p class="mb-3">
            <span class="etiqueta d-block">Última ubicación:</span>
            <span class="small">${p.location.name}</span>
          </p>
          <button class="btn btn-primary btn-sm mt-auto" data-id="${p.id}">Detalle</button>
        </div>
      </div>
    </div>`;
}

async function cargarPagina() {
  mensaje.innerHTML = "";
  galeria.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border" role="status"></div></div>`;
  try {
    const res = await fetch(`${API}/character?page=${pagina}`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const datos = await res.json();
    totalPaginas = datos.info.pages;
    galeria.innerHTML = datos.results.map(tarjeta).join("");
    paginaTexto.textContent = `Página ${pagina} de ${totalPaginas}`;
    btnAnterior.disabled = pagina === 1;
    btnSiguiente.disabled = pagina === totalPaginas;
  } catch (e) {
    galeria.innerHTML = "";
    mostrarError("No se pudieron cargar los personajes. Revisa tu conexión e inténtalo de nuevo.");
    console.error(e);
  }
}

async function abrirDetalle(id) {
  try {
    const res = await fetch(`${API}/character/${id}`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const p = await res.json();
    document.getElementById("modalTitulo").textContent = p.name;
    const img = document.getElementById("modalImagen");
    img.src = p.image;
    img.alt = p.name;
    const filas = [
      ["ID", p.id],
      ["Estado", `<span class="punto ${claseEstado(p.status)}"></span>${p.status}`],
      ["Especie", p.species],
      ["Género", p.gender],
      ["Tipo", p.type || "Sin tipo"],
      ["Origen", p.origin.name],
      ["Última ubicación", p.location.name],
      ["Episodios", p.episode.length],
      ["Creado", formatearFecha(p.created)]
    ];
    document.getElementById("modalDatos").innerHTML = filas
      .map(([k, v]) => `<tr><th class="etiqueta fw-normal">${k}</th><td>${v}</td></tr>`)
      .join("");
    modal.show();
  } catch (e) {
    mostrarError("No se pudo cargar el detalle del personaje.");
    console.error(e);
  }
}

galeria.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) abrirDetalle(btn.dataset.id);
});

btnAnterior.addEventListener("click", () => { if (pagina > 1) { pagina--; cargarPagina(); } });
btnSiguiente.addEventListener("click", () => { if (pagina < totalPaginas) { pagina++; cargarPagina(); } });

cargarPagina();
