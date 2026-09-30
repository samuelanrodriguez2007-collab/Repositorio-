(function () {
  "use strict";

  const fmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  // ---------- Menú móvil ----------
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // ---------- Lotes de ejemplo ----------
  const LOTES = [
    { finca: "Finca La Esperanza", productor: "Rosa Muñoz", region: "Huila", altura: 1750, variedad: "Caturra", proceso: "Lavado", puntaje: 86.5, kg: 600, precio: 32000, notas: "Panela, mandarina y chocolate con leche." },
    { finca: "El Mirador", productor: "Jorge Ortiz", region: "Nariño", altura: 2050, variedad: "Castillo", proceso: "Honey", puntaje: 87.25, kg: 350, precio: 36000, notas: "Frutos rojos, miel y acidez brillante." },
    { finca: "Villa Luz", productor: "Familia Restrepo", region: "Antioquia", altura: 1600, variedad: "Colombia", proceso: "Lavado", puntaje: 84, kg: 1200, precio: 27000, notas: "Caramelo, nuez y cuerpo cremoso." },
    { finca: "Alto de los Andes", productor: "Marta Quintero", region: "Tolima", altura: 1900, variedad: "Geisha", proceso: "Natural", puntaje: 89.5, kg: 120, precio: 68000, notas: "Jazmín, durazno y té negro." },
    { finca: "La Palma", productor: "Luis Guerrero", region: "Cauca", altura: 1820, variedad: "Tabi", proceso: "Natural", puntaje: 87, kg: 400, precio: 38000, notas: "Uva, cacao y final a vino tinto." },
    { finca: "San Isidro", productor: "Ana Beltrán", region: "Huila", altura: 1680, variedad: "Pink Bourbon", proceso: "Honey", puntaje: 88.25, kg: 250, precio: 45000, notas: "Maracuyá, rosas y azúcar morena." },
    { finca: "Buenos Aires", productor: "Carlos Rincón", region: "Santander", altura: 1500, variedad: "Castillo", proceso: "Lavado", puntaje: 84.5, kg: 900, precio: 28000, notas: "Chocolate oscuro y almendra." },
    { finca: "El Diviso", productor: "Nestor Lasso", region: "Cauca", altura: 1950, variedad: "Sidra", proceso: "Lavado", puntaje: 88.75, kg: 180, precio: 52000, notas: "Limonaria, bergamota y miel de abejas." }
  ];

  const grid = document.getElementById("lotes-grid");
  const vacio = document.getElementById("lotes-vacio");
  const fRegion = document.getElementById("filtro-region");
  const fProceso = document.getElementById("filtro-proceso");
  const fPuntaje = document.getElementById("filtro-puntaje");

  const unique = (key) => [...new Set(LOTES.map((l) => l[key]))].sort();
  unique("region").forEach((r) => fRegion.add(new Option(r, r)));
  unique("proceso").forEach((p) => fProceso.add(new Option(p, p)));

  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderLotes() {
    const region = fRegion.value;
    const proceso = fProceso.value;
    const min = Number(fPuntaje.value);
    const lista = LOTES.filter((l) =>
      (!region || l.region === region) &&
      (!proceso || l.proceso === proceso) &&
      l.puntaje >= min
    );

    grid.innerHTML = lista.map((l) => `
      <article class="lot">
        <div class="lot__head">
          <h3>${escape(l.finca)}</h3>
          <span class="lot__score" title="Puntaje SCA">${l.puntaje}</span>
        </div>
        <p class="lot__farm">${escape(l.productor)} · ${escape(l.region)}</p>
        <div class="lot__tags">
          <span class="tag">${escape(l.variedad)}</span>
          <span class="tag">${escape(l.proceso)}</span>
          <span class="tag">${l.altura.toLocaleString("es-CO")} msnm</span>
          <span class="tag">${l.kg.toLocaleString("es-CO")} kg</span>
        </div>
        <p class="lot__notes">“${escape(l.notas)}”</p>
        <div class="lot__foot">
          <span class="lot__price">${fmt.format(l.precio)} <small>/kg</small></span>
          <button class="lot__btn" type="button" data-finca="${escape(l.finca)}">Pedir muestra →</button>
        </div>
      </article>`).join("");

    vacio.hidden = lista.length > 0;
  }

  [fRegion, fProceso, fPuntaje].forEach((el) => el.addEventListener("change", renderLotes));
  renderLotes();

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".lot__btn");
    if (!btn) return;
    setRole("tienda");
    const msg = form.elements.mensaje;
    msg.value = `Quiero una muestra del lote de ${btn.dataset.finca}.`;
    document.getElementById("registro").scrollIntoView({ behavior: "smooth" });
    btn.textContent = "Solicitada ✓";
    btn.disabled = true;
  });

  // ---------- Cotizador ----------
  const TARIFAS = {
    recoleccionKg: 350,      // recoger en finca
    transporteKgKm: 2.2,     // por kg y por km
    proceso: { verde: 900, tostado: 2600, empacado: 4200 }, // por kg
    minimo: 150000,
    comision: 0.08
  };

  const qForm = document.getElementById("quote-form");
  const qOut = document.getElementById("quote-result");

  function cotizar() {
    const kg = Math.max(0, Number(document.getElementById("q-kg").value) || 0);
    const km = Math.max(0, Number(document.getElementById("q-km").value) || 0);
    const proceso = document.getElementById("q-proceso").value;
    const precio = Math.max(0, Number(document.getElementById("q-precio").value) || 0);

    const recoleccion = kg * TARIFAS.recoleccionKg;
    const transporte = kg * km * TARIFAS.transporteKgKm;
    const procesamiento = kg * TARIFAS.proceso[proceso];
    const logistica = Math.max(TARIFAS.minimo, recoleccion + transporte + procesamiento);
    const comision = kg * precio * TARIFAS.comision;
    const total = logistica + comision;

    const filas = [
      ["Recolección en finca", recoleccion],
      ["Transporte", transporte],
      ["Procesamiento", procesamiento],
      ["Comisión de conexión (8%)", comision],
      [kg > 0 ? `Total servicio (${fmt.format(total / kg)}/kg)` : "Total servicio", total]
    ];
    qOut.innerHTML = filas.map(([k, v]) => `<div><dt>${k}</dt><dd>${fmt.format(v)}</dd></div>`).join("");
  }
  qForm.addEventListener("input", cotizar);
  qForm.addEventListener("submit", (e) => e.preventDefault());
  cotizar();

  // ---------- Registro ----------
  const form = document.getElementById("registro-form");
  const status = document.getElementById("form-status");
  const tabs = form.querySelectorAll(".tab");
  let role = "caficultor";

  function setRole(r) {
    role = r;
    tabs.forEach((t) => {
      const active = t.dataset.role === r;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    form.querySelectorAll(".role-fields").forEach((g) => { g.hidden = g.dataset.for !== r; });
    status.textContent = "";
  }

  tabs.forEach((t) => t.addEventListener("click", () => setRole(t.dataset.role)));
  document.querySelectorAll(".js-role").forEach((a) =>
    a.addEventListener("click", () => setRole(a.dataset.role))
  );

  const REQUERIDOS = {
    caficultor: ["nombre", "telefono", "correo", "finca", "ubicacion"],
    tienda: ["nombre", "telefono", "correo", "tienda", "ciudad"]
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valido = true;
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

    REQUERIDOS[role].forEach((name) => {
      const el = form.elements[name];
      const ok = el.value.trim() !== "" && (el.type !== "email" || /^\S+@\S+\.\S+$/.test(el.value));
      if (!ok) { el.classList.add("is-invalid"); valido = false; }
    });

    if (!valido) {
      status.className = "form__status err";
      status.textContent = "Revisa los campos marcados.";
      return;
    }

    const datos = { rol: role, fecha: new Date().toISOString() };
    new FormData(form).forEach((v, k) => { if (String(v).trim()) datos[k] = String(v).trim(); });

    try {
      const guardados = JSON.parse(localStorage.getItem("origen-registros") || "[]");
      guardados.push(datos);
      localStorage.setItem("origen-registros", JSON.stringify(guardados));
    } catch (_) { /* almacenamiento no disponible: se ignora */ }

    status.className = "form__status ok";
    status.textContent = role === "caficultor"
      ? `¡Gracias, ${datos.nombre}! Te contactaremos para visitar ${datos.finca}.`
      : `¡Gracias, ${datos.nombre}! Pronto te enviaremos cafés que encajan con ${datos.tienda}.`;
    form.reset();
    setTimeout(() => setRole(role), 0);
  });

  // ---------- Contadores y animaciones ----------
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function contar(el) {
    const fin = Number(el.dataset.count);
    if (reduce) { el.textContent = fin; return; }
    const inicio = performance.now();
    const dur = 1200;
    (function paso(t) {
      const p = Math.min(1, (t - inicio) / dur);
      el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(paso);
    })(inicio);
  }

  document.querySelectorAll(".pillar, .steps li, .audience, .plan, .quote, .form").forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        if (en.target.dataset.count) contar(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal, [data-count]").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-count]").forEach(contar);
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
