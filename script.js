document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Cálculo automático de la edad ----------
     Fecha de nacimiento: 26 de noviembre de 1998.
     (Los meses en JavaScript van de 0 a 11, por eso noviembre = 10.) */
  const nacimiento = new Date(1998, 10, 26);

  function calcularEdad(fecha) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const difMes = hoy.getMonth() - fecha.getMonth();
    if (difMes < 0 || (difMes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }

  const edadEl = document.getElementById("edad");
  if (edadEl) {
    edadEl.textContent = calcularEdad(nacimiento);
  }

  /* ---------- Año dinámico en el footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Menú de navegación en móvil ---------- */
  const toggle = document.getElementById("nav-toggle");
  const nav = document.querySelector(".nav");
  const navList = document.getElementById("nav-list");

  function closeMenu() {
    toggle.classList.remove("open");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const abierto = nav.classList.toggle("open");
      toggle.classList.toggle("open", abierto);
      document.body.classList.toggle("menu-open", abierto);
      toggle.setAttribute("aria-expanded", String(abierto));
      toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    // Cerrar al pulsar un enlace del menú
    navList.querySelectorAll("a").forEach(function (enlace) {
      enlace.addEventListener("click", closeMenu);
    });

    // Cerrar al hacer clic fuera del menú
    document.addEventListener("click", function (event) {
      if (
        nav.classList.contains("open") &&
        !event.target.closest(".nav") &&
        !event.target.closest(".nav-toggle")
      ) {
        closeMenu();
      }
    });
  }

  /* ---------- Contador de caracteres del mensaje (máx. 500) ---------- */
  const mensaje = document.getElementById("message");
  const contador = document.getElementById("char-count");
  if (mensaje && contador) {
    const limite = mensaje.getAttribute("maxlength") || 500;
    const wrapper = contador.parentElement;
    const actualizar = function () {
      const n = mensaje.value.length;
      contador.textContent = n;
      wrapper.classList.toggle("limit", n >= limite);
    };
    mensaje.addEventListener("input", actualizar);
    actualizar();
  }

  /* ---------- Envío del formulario de contacto (AJAX) ---------- */
  const form = document.getElementById("contact-form");
  const estado = document.getElementById("form-status");
  if (form && estado) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const boton = form.querySelector('button[type="submit"]');
      const textoOriginal = boton.textContent;
      estado.className = "form-status";
      estado.textContent = "";
      boton.disabled = true;
      boton.textContent = "Enviando...";

      fetch(form.action, {
        method: "POST",
        body: new URLSearchParams(new FormData(form)).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          estado.textContent = data.mensaje;
          estado.classList.add(data.ok ? "ok" : "error");
          if (data.ok) {
            form.reset();
            if (contador) {
              contador.textContent = "0";
              contador.parentElement.classList.remove("limit");
            }
          }
        })
        .catch(function () {
          estado.textContent =
            "No se ha podido enviar. Revisa tu conexión e inténtalo de nuevo.";
          estado.classList.add("error");
        })
        .finally(function () {
          boton.disabled = false;
          boton.textContent = textoOriginal;
        });
    });
  }

  /* ---------- Proyectos: botón "Mostrar más" (móvil) ---------- */
  document.querySelectorAll(".project-toggle").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const card = boton.closest(".project-card");
      const abierto = card.classList.toggle("expanded");
      boton.setAttribute("aria-expanded", String(abierto));
      const texto = boton.querySelector(".project-toggle-text");
      if (texto) {
        texto.textContent = abierto ? "Mostrar menos" : "Mostrar más";
      }
    });
  });

  /* ---------- Animaciones de aparición al hacer scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Resaltado del enlace activo según la sección ---------- */
  const secciones = document.querySelectorAll("main section[id]");
  const enlacesNav = document.querySelectorAll(".nav-list a");

  if ("IntersectionObserver" in window && secciones.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            enlacesNav.forEach(function (a) {
              a.classList.toggle(
                "active",
                a.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secciones.forEach(function (sec) {
      spy.observe(sec);
    });
  }
});
