// ==========================================================================
// CONTROL INTERACTIVO DE PESTAÑAS (HOME/BOOK NOW) Y ACCIONES - OASIS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {

    // Manejar retorno de MercadoPago
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status') || urlParams.get('status');

    if (paymentStatus === 'approved') {
        const reservaPendiente = JSON.parse(localStorage.getItem('reserva_pendiente'));
        const paymentId = urlParams.get('payment_id');
        if (reservaPendiente) {
            const precios = { 'cobro-normal': 15000, 'plan-1': 45000, 'plan-2': 75000, 'plan-3': 120000 };
            const planId = reservaPendiente.observaciones.replace('Plan: ', '');
            console.log('planId:', planId); // ← aquí
            console.log('precio:', precios[planId]); // ← y aquí
            reservaPendiente.precio_total = precios[planId] || 0;
            reservaPendiente.payment_id = paymentId;

            fetch('https://proyecto-oasis-ar.onrender.com/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaPendiente)
            })
            .then(res => res.json())
            .then(data => {
                localStorage.removeItem('reserva_pendiente');
                alert(`✅ Pago exitoso! Reserva creada ID: ${data.id_reserva}`);
            })
            .catch(err => console.error(err));
        }
    } else if (paymentStatus === 'failure') {
        alert('❌ El pago fue rechazado. Intenta de nuevo.');
        localStorage.removeItem('reserva_pendiente');
    }
    // ==========================================
    // 1. DECLARACIONES DE ELEMENTOS DOM
    // ==========================================

    // Pestañas y vistas principales
    const tabHome               = document.getElementById("tab-home");
    const tabBook               = document.getElementById("tab-book");
    const viewHome              = document.getElementById("view-home");
    const viewBook              = document.getElementById("view-book");
    const viewReservas          = document.getElementById("view-reservas");
    const logoTrigger           = document.getElementById("nav-logo");
    const heroStartBtn          = document.getElementById("hero-start-booking");
    const openBookingTriggers   = document.querySelectorAll(".open-booking-trigger");
    const heroViewPlans         = document.getElementById("hero-view-plans");
    const plansSection          = document.getElementById("plans-section-target");

    // Elementos Auth
    const openAuthBtn           = document.getElementById("open-auth-btn");
    const openAuthBtnDesktop    = document.getElementById("open-auth-btn-desktop");
    const closeAuthBtn          = document.getElementById("close-auth-btn");
    const authModal             = document.getElementById("auth-modal");
    const tabLoginBtn           = document.getElementById("tab-login-btn");
    const tabSignupBtn          = document.getElementById("tab-signup-btn");
    const formLogin             = document.getElementById("form-login");
    const formSignup            = document.getElementById("form-signup");

    // Elementos User Menu
    const btnDesktop            = document.getElementById('open-auth-btn-desktop');
    const userMenu              = document.getElementById('user-menu');
    const userMenuName          = document.getElementById('user-menu-name');
    const userDropdown          = document.getElementById('user-dropdown');
    const userMenuTrigger       = document.getElementById('user-menu-trigger');
    const dropdownLogout        = document.getElementById('dropdown-logout');
    const dropdownReservas      = document.getElementById('dropdown-reservas');

    // Elementos Menú Sándwich (móvil)
    const menuToggle            = document.getElementById('menu-toggle');
    const navLinks              = document.getElementById('nav-links');
    const mobileUserItem        = document.querySelector('.mobile-user-item');
    const userMenuNameMobile    = document.getElementById('user-menu-name-mobile');
    const dropdownReservasMobile = document.getElementById('dropdown-reservas-mobile');
    const dropdownLogoutMobile  = document.getElementById('dropdown-logout-mobile');

    // Elementos Wizard
    const stepPanels    = document.querySelectorAll(".wizard-step-panel");
    const prevBtn       = document.getElementById("wizard-prev-btn");
    const nextBtn       = document.getElementById("wizard-next-btn");
    const progressLine  = document.getElementById("wizard-progress-line");
    const planCards     = document.querySelectorAll(".wizard-plan-card");
    const hourButtons   = document.querySelectorAll(".hour-grid-btn");
    const minusBtn      = document.getElementById("wizard-minus-btn");
    const plusBtn       = document.getElementById("wizard-plus-btn");
    const guestsInput   = document.getElementById("wizard-guests-input");
    const datePicker    = document.getElementById("wizard-date-picker");

    // Estados del wizard
    let currentStep  = 1;
    let selectedPlan = null;
    let selectedHour = null;

    // Estados del resumen de pago
    let selectedPlanPrice = 0;
    let selectedPlanName  = "";

    // ==========================================
    // 2. FUNCIONES DE NAVEGACIÓN
    // ==========================================

    function closeMenu() {
        if (navLinks) navLinks.classList.remove('active');
        if (menuToggle) menuToggle.querySelector('i').className = 'fa-solid fa-bars';
    }

    function showHomeTab() {
        tabHome.classList.add("active");
        tabBook.classList.remove("active");
        viewHome.classList.add("active");
        viewBook.classList.remove("active");
        if (viewReservas) viewReservas.classList.remove("active");
        closeMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showBookTab() {
        tabBook.classList.add("active");
        tabHome.classList.remove("active");
        viewBook.classList.add("active");
        viewHome.classList.remove("active");
        if (viewReservas) viewReservas.classList.remove("active");
        closeMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showReservasTab() {
        if (!viewReservas) return;
        tabHome.classList.remove("active");
        tabBook.classList.remove("active");
        viewHome.classList.remove("active");
        viewBook.classList.remove("active");
        viewReservas.classList.add("active");
        if (userDropdown) userDropdown.classList.remove('show');
        closeMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        cargarReservas();
    }

    // ==========================================
    // 3. FUNCIONES DE UI DE AUTENTICACIÓN
    // ==========================================

    function updateAuthUI() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario && usuario.id_usuario) {
            // Desktop
            if (btnDesktop)   btnDesktop.style.display  = 'none';
            if (userMenu)     userMenu.style.display    = 'block';
            if (userMenuName) userMenuName.textContent  = usuario.nombre || usuario.correo;
            // Móvil: ocultar botón login, mostrar usuario
            document.querySelector('.mobile-auth-item') &&
                (document.querySelector('.mobile-auth-item').style.display = 'none');
            if (mobileUserItem) {
                mobileUserItem.style.display = window.innerWidth <= 768 ? 'block' : 'none';
            }
            if (userMenuNameMobile) userMenuNameMobile.textContent   = usuario.nombre || usuario.correo;
        } else {
            // Desktop
            if (btnDesktop)   btnDesktop.style.display  = 'block';
            if (userMenu)     userMenu.style.display    = 'none';
            if (userDropdown) userDropdown.classList.remove('show');
            // Móvil
            document.querySelector('.mobile-auth-item') &&
                (document.querySelector('.mobile-auth-item').style.display = '');
            if (mobileUserItem) mobileUserItem.style.display = 'none';
        }
    }

    // ==========================================
    // 4. FUNCIONES DEL WIZARD
    // ==========================================

    function validateCurrentStepForm() {
        if (currentStep === 1) {
            nextBtn.disabled = !selectedPlan;
        } else {
            nextBtn.disabled = false;
        }
    }

    function updateWizardUI() {
        stepPanels.forEach((panel, idx) => {
            panel.classList.toggle("active", idx + 1 === currentStep);
        });

        for (let i = 1; i <= 4; i++) {
            const dot = document.getElementById(`step-dot-${i}`);
            if (dot) {
                if (i < currentStep) {
                    dot.classList.add("completed");
                    dot.classList.remove("active");
                } else if (i === currentStep) {
                    dot.classList.remove("completed");
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("completed", "active");
                }
            }
        }

        const progressPercentages = { 1: 0, 2: 33, 3: 66, 4: 100 };
        if (progressLine) progressLine.style.width = `${progressPercentages[currentStep]}%`;

        if (prevBtn) prevBtn.classList.toggle("hidden", currentStep === 1);

        if (nextBtn) {
            nextBtn.innerHTML = currentStep === 4
                ? `Complete Payment <i class="fa-solid fa-credit-card"></i>`
                : `Next <i class="fa-solid fa-arrow-right"></i>`;
        }

        validateCurrentStepForm();

        if (nextBtn) {
            nextBtn.style.display = currentStep === 4 ? 'none' : 'block';
        }
        if (prevBtn) {
            prevBtn.classList.toggle('hidden', currentStep === 1);
        }
    }

    // ==========================================
    // 5. FUNCIONES DE RESERVAS
    // ==========================================

    const PLANES = {
        'cobro-normal': { nombre: 'Hourly Pass',   precio: '$15.000',  horas: 1 },
        'plan-1': { nombre: 'Fresh Day pass', precio: '$45.000',  horas: 3 },
        'plan-2': { nombre: 'Half Day Pass', precio: '$75.000', horas: 5 },
        'plan-3': { nombre: 'Full Day Pass', precio: '$120.000', horas: 8 },
    };

    function getPlanFromObservaciones(obs) {
        if (!obs) return { nombre: 'Pool Pass', precio: '—', horas: '—' };
        const match = obs.match(/plan-\d/);
        if (match && PLANES[match[0]]) return PLANES[match[0]];
        return { nombre: obs, precio: '—', horas: '—' };
    }

    function formatFecha(fechaStr) {
        if (!fechaStr) return '—';
        const d = new Date(fechaStr);
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    async function cargarReservas() {
        const loadingEl = document.getElementById('reservas-loading');
        const emptyEl   = document.getElementById('reservas-empty');
        const listEl    = document.getElementById('reservas-list');

        if (!loadingEl || !emptyEl || !listEl) return;

        loadingEl.style.display = 'block';
        emptyEl.style.display   = 'none';
        listEl.style.display    = 'none';
        listEl.innerHTML        = '';

        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) {
            loadingEl.style.display = 'none';
            emptyEl.style.display   = 'block';
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`https://proyecto-oasis-ar.onrender.com/reservas/usuario/${usuario.id_usuario}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            loadingEl.style.display = 'none';

            const reservas = Array.isArray(data) ? data : (data.reservas || []);

            if (!reservas.length) {
                emptyEl.style.display = 'block';
                return;
            }

            listEl.style.display = 'flex';
            renderReservas(reservas, listEl);

        } catch (err) {
            loadingEl.style.display = 'none';
            listEl.style.display    = 'block';
            listEl.innerHTML = `
                <div class="reservas-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>No se pudo conectar con el servidor.<br>Verifica tu conexión e intenta de nuevo.</p>
                </div>`;
        }
    }

    function renderReservas(reservas, listEl, filtro = 'todas') {

        listEl.innerHTML = '';
        const filtradas = filtro === 'todas'
            ? reservas
            : reservas.filter(r => (r.estado || 'confirmada').toLowerCase() === filtro);

        if (!filtradas.length) {
            listEl.innerHTML = `<div class="reservas-error"><i class="fa-regular fa-calendar-xmark"></i><p>No hay reservas con ese filtro.</p></div>`;
            return;
        }

        filtradas.forEach(r => {
            console.log('fecha_reserva:', r.fecha_reserva);
            const plan  = getPlanFromObservaciones(r.observaciones);
            const estado = (r.estado || 'pendiente').toLowerCase();
            const precioMostrar = r.precio_total
                ? `$${Number(r.precio_total).toLocaleString('es-CO')}`
                : plan.precio;

            const card = document.createElement('div');
            card.className = 'reserva-card';
            card.innerHTML = `
                <div class="reserva-icon-col">
                    <i class="fa-solid fa-water-ladder"></i>
                </div>
                <div class="reserva-info">
                    <div class="reserva-info-top">
                        <span class="reserva-plan-name">${plan.nombre}</span>
                        <span class="reserva-estado ${estado}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                    </div>
                    <div class="reserva-detalles">
                        <span class="reserva-detalle-item">
                            <i class="fa-regular fa-calendar"></i> ${formatFecha(r.fecha_reserva)}
                        </span>
                        <span class="reserva-detalle-item">
                            <i class="fa-regular fa-clock"></i> ${r.hora_inicio || '—'}${r.hora_fin ? ' – ' + r.hora_fin : ''}
                        </span>
                        <span class="reserva-detalle-item">
                            <i class="fa-solid fa-users"></i> ${r.num_invitados || 1} invitado(s)
                        </span>
                        <span class="reserva-detalle-item">
                            <i class="fa-solid fa-hourglass-half"></i> ${r.duracion_horas || plan.horas} hrs
                        </span>
                    </div>
                    <div class="reserva-id">ID: #${r.id_reserva || '—'}</div>
                </div>
                <div class="reserva-actions-col">
                    <span class="reserva-precio">${precioMostrar}</span>
                    ${estado !== 'cancelada' ? `<button class="btn-cancelar-reserva" data-id="${r.id_reserva}"><i class="fa-solid fa-xmark"></i> Cancelar</button>` : ''}
                </div>`;

            const cancelBtn = card.querySelector('.btn-cancelar-reserva');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => cancelarReserva(r.id_reserva, card, r, reservas, listEl));
            }
            listEl.appendChild(card);
        });

        // Guardar reservas en el elemento para re-renderizado por filtro
        listEl._reservas = reservas;
    }

    async function cancelarReserva(id, cardEl, reserva, todasReservas, listEl) {
        if (!confirm(`¿Confirmas cancelar la reserva #${id}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://proyecto-oasis-ar.onrender.com/reservas/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ estado: 'cancelada' })
            });
            if (!res.ok) throw new Error();
            reserva.estado = 'cancelada';
            const filtroActivo = document.querySelector('.filtro-btn.active')?.dataset.filtro || 'todas';
            renderReservas(todasReservas, listEl, filtroActivo);
        } catch {
            alert('❌ No se pudo cancelar. Intenta de nuevo.');
        }
    }

    // ==========================================
    // 6. FUNCIONES DE RESUMEN DE PAGO
    // ==========================================

    function actualizarResumen() {
        // Plan
        const summaryPlan = document.getElementById("summary-plan");
        if (summaryPlan) summaryPlan.textContent = selectedPlanName || "No seleccionado";

        const summaryPlanPrice = document.getElementById("summary-plan-price");
        if (summaryPlanPrice) summaryPlanPrice.textContent = "$" + selectedPlanPrice.toLocaleString("es-CO");

        // Fecha
        const fecha = document.getElementById("wizard-date-picker")?.value;
        const summaryDate = document.getElementById("summary-date");
        if (summaryDate && fecha) {
            const [y, m, d] = fecha.split('-');
            summaryDate.textContent = `${d}/${m}/${y}`;
        } else if (summaryDate) {
            summaryDate.textContent = '--/--/----';
        }

        // Invitados
        const summaryGuests = document.getElementById("summary-guests");
        if (summaryGuests) summaryGuests.textContent = document.getElementById("wizard-guests-input")?.value || 1;

        // Hora
        const horaActiva = document.querySelector(".hour-grid-btn.active");
        const summaryHour = document.getElementById("summary-hour");
        if (summaryHour) summaryHour.textContent = horaActiva ? horaActiva.textContent : "--:--";

        // Complementos
        let totalAddons = 0;
        const addonsSeleccionados = document.querySelectorAll('input[name="addon"]:checked');
        const lista = document.getElementById("summary-addons-list");
        if (lista) {
            lista.innerHTML = "";
            if (addonsSeleccionados.length === 0) {
                lista.innerHTML = "<li>No seleccionados</li>";
            } else {
                addonsSeleccionados.forEach(addon => {
                    const precio = parseInt(addon.dataset.price);
                    totalAddons += precio;
                    const item = document.createElement("li");
                    item.textContent = addon.value + " ($" + precio.toLocaleString("es-CO") + ")";
                    lista.appendChild(item);
                });
            }
        }

        const summaryAddonPrice = document.getElementById("summary-addon-price");
        if (summaryAddonPrice) summaryAddonPrice.textContent = "$" + totalAddons.toLocaleString("es-CO");

        // Total
        const total = selectedPlanPrice + totalAddons;
        const summaryTotal = document.getElementById("summary-total");
        if (summaryTotal) summaryTotal.textContent = "$" + total.toLocaleString("es-CO") + " COP";
    }

    // ==========================================
    // 7. FUNCIONES DE HORARIOS
    // ==========================================

    function getTodayString() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd   = String(hoy.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function actualizarHorasDisponibles() {
        const fechaSeleccionada = document.getElementById("wizard-date-picker").value;
        const hoyString  = getTodayString();
        const horaActual = new Date().getHours();

        document.querySelectorAll(".hour-grid-btn").forEach(btn => {
            const horaBtn = parseInt(btn.dataset.hour);
            btn.classList.remove("disabled");
            if (fechaSeleccionada === hoyString && horaBtn <= horaActual) {
                btn.classList.add("disabled");
                btn.classList.remove("active");
            }
        });
    }

    // ==========================================
    // 8. EVENT LISTENERS
    // ==========================================

    // --- Navegación entre pestañas ---
    if (tabHome)     tabHome.addEventListener("click", (e) => { e.preventDefault(); showHomeTab(); });
    if (tabBook)     tabBook.addEventListener("click", (e) => { e.preventDefault(); showBookTab(); });
    if (logoTrigger) logoTrigger.addEventListener("click", showHomeTab);
    if (heroStartBtn) heroStartBtn.addEventListener("click", showBookTab);
    if (heroViewPlans && plansSection) {
        heroViewPlans.addEventListener("click", () => plansSection.scrollIntoView({ behavior: "smooth" }));
    }

    openBookingTriggers.forEach(trigger => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            showBookTab();
            const planId = trigger.getAttribute("data-plan-id");
            if (planId) {
                document.querySelectorAll(".wizard-plan-card").forEach(card => {
                    card.classList.remove("selected");
                    const btn = card.querySelector(".select-plan-action-btn");
                    if (btn) btn.textContent = "Select Plan";
                });
                const targetPlan = document.querySelector(`.wizard-plan-card[data-plan-id="${planId}"]`);
                if (targetPlan) {
                    targetPlan.classList.add("selected");
                    const btn = targetPlan.querySelector(".select-plan-action-btn");
                    if (btn) btn.textContent = "Selected";
                    selectedPlan = targetPlan.getAttribute("data-plan");
                    validateCurrentStepForm();
                }
            }
        });
    });

    // --- Modal de autenticación ---
    if (openAuthBtn) {
        openAuthBtn.addEventListener("click", (e) => { e.preventDefault(); authModal.classList.add("show"); });
    }
    if (openAuthBtnDesktop) {
        openAuthBtnDesktop.addEventListener("click", (e) => { e.preventDefault(); authModal.classList.add("show"); });
    }
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", () => authModal.classList.remove("show"));
    }
    window.addEventListener("click", (e) => {
        if (e.target === authModal) authModal.classList.remove("show");
    });

    // --- Tabs Login / Signup ---
    if (tabLoginBtn) {
        tabLoginBtn.addEventListener("click", () => {
            tabLoginBtn.classList.add("active");
            tabSignupBtn.classList.remove("active");
            formLogin.classList.add("active");
            formSignup.classList.remove("active");
        });
    }
    if (tabSignupBtn) {
        tabSignupBtn.addEventListener("click", () => {
            tabSignupBtn.classList.add("active");
            tabLoginBtn.classList.remove("active");
            formSignup.classList.add("active");
            formLogin.classList.remove("active");
        });
    }

    // --- User dropdown ---
    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('show');
        });
    }
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target) && userDropdown) {
            userDropdown.classList.remove('show');
        }
    });

    // --- Logout ---
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            updateAuthUI();
            showHomeTab();
            alert('👋 Sesión cerrada');
        });
    }

    // --- Mis Reservas ---
    if (dropdownReservas) {
        dropdownReservas.addEventListener('click', (e) => {
            e.preventDefault();
            showReservasTab();
        });
    }
    document.getElementById('reservas-nueva-btn')?.addEventListener('click', showBookTab);
    document.getElementById('reservas-empty-btn')?.addEventListener('click', showBookTab);

    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const listEl = document.getElementById('reservas-list');
            if (listEl && listEl._reservas) {
                renderReservas(listEl._reservas, listEl, btn.dataset.filtro);
            }
        });
    });

    // --- Login ---
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo   = formLogin.querySelector('input[type="email"]').value;
            const password = formLogin.querySelector('input[type="password"]').value;
            try {
                const res  = await fetch('https://proyecto-oasis-ar.onrender.com/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });
                const data = await res.json();
                if (!res.ok) { alert('❌ ' + data.error); return; }
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                alert(`✅ Bienvenido, ${data.usuario.nombre}!`);
                authModal.classList.remove('show');
                updateAuthUI();
            } catch {
                alert('❌ Error conectando con el servidor');
            }
        });
    }

    // --- Register ---
    if (formSignup) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre   = document.getElementById('signup-firstname')?.value;
            const apellido = document.getElementById('signup-lastname')?.value;
            const correo   = document.getElementById('signup-email')?.value;
            const telefono = document.getElementById('signup-phone')?.value;
            const password = document.getElementById('signup-password')?.value;
            const documento = document.getElementById('signup-document')?.value;
            try {
                const res  = await fetch('https://proyecto-oasis-ar.onrender.com/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento, nombre, apellido, correo, telefono, password })
                });
                const data = await res.json();
                if (!res.ok) { alert('❌ ' + data.error); return; }
                alert('✅ Cuenta creada! Ya puedes iniciar sesión.');
                tabLoginBtn?.click();
            } catch {
                alert('❌ Error conectando con el servidor');
            }
        });
    }

    // --- Wizard: Selección de plan ---
    planCards.forEach(card => {
        card.addEventListener("click", () => {
            planCards.forEach(c => {
                c.classList.remove("selected");
                c.querySelector(".select-plan-action-btn").textContent = "Select Plan";
            });
            card.classList.add("selected");
            card.querySelector(".select-plan-action-btn").textContent = "Selected";
            selectedPlan      = card.getAttribute("data-plan");
            selectedPlanName  = card.querySelector("h4").textContent;
            selectedPlanPrice = parseInt(card.dataset.price);
            validateCurrentStepForm();
            actualizarResumen();
        });
    });

    // --- Wizard: Selección de hora ---
    hourButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            hourButtons.forEach(b => b.classList.remove("selected", "active"));
            btn.classList.add("selected", "active");
            selectedHour = btn.textContent;
            actualizarResumen();
        });
    });

    // --- Wizard: Contador de invitados ---
    if (minusBtn && plusBtn && guestsInput) {
        minusBtn.addEventListener("click", () => {
            const val = parseInt(guestsInput.value);
            if (val > 1) guestsInput.value = val - 1;
            actualizarResumen();
        });
        plusBtn.addEventListener("click", () => {
            const val = parseInt(guestsInput.value);
            if (val < 50) guestsInput.value = val + 1;
            actualizarResumen();
        });
    }

    // --- Wizard: Selector de fecha ---
    if (datePicker) {
        datePicker.min = getTodayString();
        datePicker.addEventListener("change", () => {
            actualizarHorasDisponibles();
            actualizarResumen();
        });
    }

    // --- Wizard: Addons ---
    document.querySelectorAll('input[name="addon"]').forEach(addon => {
        addon.addEventListener("change", actualizarResumen);
    });

    // --- Wizard: Input de invitados (cambio manual) ---
    if (guestsInput) {
        guestsInput.addEventListener("change", actualizarResumen);
        guestsInput.addEventListener("input",  actualizarResumen);
    }

    // --- Wizard: Navegación (Siguiente / Anterior) ---
    if (nextBtn) {
        nextBtn.addEventListener("click", async () => {
            if (currentStep < 4) {
                currentStep++;
                updateWizardUI();
            } else {
                // En paso 4 el nextBtn no hace nada, los botones manejan la acción
                return;
            }
        });
    }

    // --- Botón Pagar con MercadoPago ---
    const btnPagarMP = document.getElementById('btn-pagar-mp');
    if (btnPagarMP) {
        btnPagarMP.addEventListener('click', async () => {
            const fecha         = datePicker?.value;
            const hora_inicio   = selectedHour || null;
            const num_invitados = parseInt(guestsInput?.value || "1");
            const duraciones    = { 'cobro-normal': 1, 'plan-1': 3, 'plan-2': 5, 'plan-3': 8 };
            const duracion      = duraciones[selectedPlan] || 3;
            const usuario       = JSON.parse(localStorage.getItem('usuario'));

            if (!usuario) { alert('❌ Debes iniciar sesión'); return; }
            if (!fecha)   { alert('❌ Selecciona una fecha'); return; }
            if (!hora_inicio) { alert('❌ Selecciona una hora'); return; }

            const [hh, mm] = hora_inicio.split(':').map(Number);
            const hora_fin = `${String(Math.floor((hh * 60 + mm + duracion * 60) / 60) % 24).padStart(2, '0')}:${String((hh * 60 + mm + duracion * 60) % 60).padStart(2, '0')}`;

            const reservaData = {
                id_usuario: usuario.id_usuario,
                fecha_reserva: fecha,
                hora_inicio, hora_fin,
                duracion_horas: duracion,
                num_invitados,
                observaciones: `Plan: ${selectedPlan}`
            };

            const precios = { 'cobro-normal': 15000, 'plan-1': 45000, 'plan-2': 75000, 'plan-3': 120000 };
            const prefRes = await fetch('https://proyecto-oasis-ar.onrender.com/pagos/crear-preferencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: selectedPlan, precio: precios[selectedPlan] || 45000, id_reserva: 0 })
            });
            const prefData = await prefRes.json();
            if (prefData.init_point) {
                localStorage.setItem('reserva_pendiente', JSON.stringify(reservaData));
                window.location.href = prefData.init_point;
            } else {
                alert('❌ Error iniciando el pago');
            }
        });
    }

    // --- Botón Reservar sin pagar ---
    const btnSinPagar = document.getElementById('btn-sin-pagar');
    if (btnSinPagar) {
        btnSinPagar.addEventListener('click', async () => {
            const fecha         = datePicker?.value;
            const hora_inicio   = selectedHour || null;
            const num_invitados = parseInt(guestsInput?.value || "1");
            const duraciones    = { 'cobro-normal': 1, 'plan-1': 3, 'plan-2': 5, 'plan-3': 8 };
            const duracion      = duraciones[selectedPlan] || 3;
            const usuario       = JSON.parse(localStorage.getItem('usuario'));

            if (!usuario) { alert('❌ Debes iniciar sesión'); return; }
            if (!fecha)   { alert('❌ Selecciona una fecha'); return; }
            if (!hora_inicio) { alert('❌ Selecciona una hora'); return; }

            const [hh, mm] = hora_inicio.split(':').map(Number);
            const hora_fin = `${String(Math.floor((hh * 60 + mm + duracion * 60) / 60) % 24).padStart(2, '0')}:${String((hh * 60 + mm + duracion * 60) % 60).padStart(2, '0')}`;

            const reservaData = {
                id_usuario: usuario.id_usuario,
                fecha_reserva: fecha,
                hora_inicio, hora_fin,
                duracion_horas: duracion,
                num_invitados,
                observaciones: `Plan: ${selectedPlan}`,
                precio_total: 0,
                estado: 'Pendiente'
            };

            const res = await fetch('https://proyecto-oasis-ar.onrender.com/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaData)
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ Reserva creada! ID: ${data.id_reserva}. Recuerda pagar antes de tu visita.`);
                currentStep = 1;
                selectedPlan = null;
                selectedHour = null;
                updateWizardUI();
                showHomeTab();
            } else {
                alert('❌ Error creando la reserva');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizardUI();
            }
        });
    }

    // --- Selección de método de pago ---
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // --- Menú sándwich (móvil) ---
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.querySelector('i').className = isOpen
                ? 'fa-solid fa-xmark'
                : 'fa-solid fa-bars';
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active')) {
            if (!navLinks.contains(e.target) && e.target !== menuToggle && !menuToggle?.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // Mis Reservas (móvil)
    if (dropdownReservasMobile) {
        dropdownReservasMobile.addEventListener('click', (e) => {
            e.preventDefault();
            showReservasTab();
        });
    }

    // Logout (móvil)
    if (dropdownLogoutMobile) {
        dropdownLogoutMobile.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            updateAuthUI();
            showHomeTab();
            alert('👋 Sesión cerrada');
        });
    }

    // ==========================================
    // 9. RESEÑAS DE USUARIOS
    // ==========================================

    const tabReviews    = document.getElementById('tab-reviews');
    const viewResenas   = document.getElementById('view-resenas');
    const btnVerResenas = document.getElementById('btn-ver-resenas');

    function showResenasTab() {
        if (!viewResenas) return;
        tabHome.classList.remove('active');
        tabBook.classList.remove('active');
        if (tabReviews) tabReviews.classList.add('active');
        viewHome.classList.remove('active');
        viewBook.classList.remove('active');
        if (viewReservas) viewReservas.classList.remove('active');
        viewResenas.classList.add('active');
        if (userDropdown) userDropdown.classList.remove('show');
        closeMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        renderResenasPage();
    }

    if (tabReviews)    tabReviews.addEventListener('click',    e => { e.preventDefault(); showResenasTab(); });
    if (btnVerResenas) btnVerResenas.addEventListener('click', ()  => showResenasTab());

    const resenaOpenAuth    = document.getElementById('resena-open-auth');
    const resenaOpenBooking = document.getElementById('resena-open-booking');
    if (resenaOpenAuth)    resenaOpenAuth.addEventListener('click',    () => { if (authModal) authModal.classList.add('show'); });
    if (resenaOpenBooking) resenaOpenBooking.addEventListener('click', () => showBookTab());

    function buildStarsHTML(count) {
        let h = '';
        for (let i = 1; i <= 5; i++)
            h += i <= count ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
        return h;
    }

    function fechaCompleta(date) {
        const d = date || new Date();
        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
    }

    function getReviews() { return JSON.parse(localStorage.getItem('oasis_reviews') || '[]'); }
    function saveReviews(arr) { localStorage.setItem('oasis_reviews', JSON.stringify(arr.slice(0, 50))); }
    function usuarioYaReseñó(id) { return getReviews().some(r => r.id_usuario === id); }
    function usuarioTieneReservas(id) {
        const r1 = JSON.parse(localStorage.getItem('reservas') || '[]');
        if (r1.some(r => r.id_usuario === id || r.usuario_id === id)) return true;
        return JSON.parse(localStorage.getItem('mis_reservas') || '[]').length > 0;
    }

    function renderPromedioEstrellas(dynamic) {
        const staticSum = 14, staticCount = 3;
        const dynSum = dynamic.reduce((a, r) => a + (r.estrellas || 0), 0);
        const total  = staticCount + dynamic.length;
        const avg    = total > 0 ? (staticSum + dynSum) / total : 5;
        const el = {
            num:   document.getElementById('promedio-numero'),
            stars: document.getElementById('promedio-stars'),
            label: document.getElementById('promedio-label')
        };
        if (el.num)   el.num.textContent   = (Math.round(avg * 10) / 10).toFixed(1);
        if (el.stars) el.stars.innerHTML   = buildStarsHTML(Math.round(avg));
        if (el.label) el.label.textContent = `${total} reseña${total !== 1 ? 's' : ''}`;
    }

    function renderResenasPage() {
        const grid = document.getElementById('resenas-grid-full');
        if (!grid) return;
        grid.innerHTML = '';
        const dynamic = getReviews();

        dynamic.forEach(r => {
            const card = document.createElement('div');
            card.className = 'review-card new-review';
            card.innerHTML = `
                <div class="review-stars">${buildStarsHTML(r.estrellas)}</div>
                <p class="review-text">"${r.texto}"</p>
                <div class="review-author">
                    <div class="review-avatar-icon"><i class="fa-solid fa-circle-user"></i></div>
                    <div class="review-author-info">
                        <span class="review-name">${r.nombre}</span>
                        <span class="review-date">${r.fecha}</span>
                    </div>
                </div>`;
            grid.appendChild(card);
        });

        const estaticas = [
            { nombre: 'Laura Castillo', estrellas: 5, texto: '¡Increíble experiencia! Las instalaciones son impecables y el proceso de reserva fue muy sencillo. Definitivamente volveré con mi familia.',          fecha: '15 de Mayo de 2025',  img: 'images/usuario1.webp' },
            { nombre: 'Juan Rodríguez', estrellas: 5, texto: 'Reservamos el Pase de Día Completo para el cumpleaños de mi hijo y fue perfecto. El espacio es amplio, limpio y muy cómodo para grupos grandes.',  fecha: '3 de Abril de 2025',  img: 'images/usuario2.jpg'  },
            { nombre: 'Sofía Mejía',    estrellas: 4, texto: 'Muy buena atención y excelentes instalaciones. El pase por horas es una opción genial para tardes relajantes. ¡100% recomendado!',                 fecha: '22 de Marzo de 2025', img: 'images/usuario3.jpg'  },
        ];
        estaticas.forEach(r => {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-stars">${buildStarsHTML(r.estrellas)}</div>
                <p class="review-text">"${r.texto}"</p>
                <div class="review-author">
                    <img src="${r.img}" alt="${r.nombre}" class="review-avatar-img">
                    <div class="review-author-info">
                        <span class="review-name">${r.nombre}</span>
                        <span class="review-date">${r.fecha}</span>
                    </div>
                </div>`;
            grid.appendChild(card);
        });

        renderPromedioEstrellas(dynamic);
        renderFormEstado();
    }

    function renderFormEstado() {
        const ids = ['resena-notice-login','resena-notice-noreserva','resena-notice-ya','resena-form-real'];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || !usuario.id_usuario) {
            const el = document.getElementById('resena-notice-login');
            if (el) el.style.display = 'flex'; return;
        }
        if (usuarioYaReseñó(usuario.id_usuario)) {
            const el = document.getElementById('resena-notice-ya');
            if (el) el.style.display = 'flex'; return;
        }
        if (!usuarioTieneReservas(usuario.id_usuario)) {
            const el = document.getElementById('resena-notice-noreserva');
            if (el) el.style.display = 'flex'; return;
        }
        const el = document.getElementById('resena-form-real');
        if (el) el.style.display = 'block';
    }

    (function initResenaForm() {
        const stars    = document.querySelectorAll('#resena-star-selector .star-input');
        const textarea = document.getElementById('resena-textarea');
        const charNum  = document.getElementById('resena-char-num');
        const btnSub   = document.getElementById('btn-submit-resena');
        let sel = 0;

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const v = parseInt(star.dataset.value);
                stars.forEach((s, i) => s.className = i < v ? 'fa-solid fa-star star-input hovered' : 'fa-regular fa-star star-input');
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => s.className = i < sel ? 'fa-solid fa-star star-input selected' : 'fa-regular fa-star star-input');
            });
            star.addEventListener('click', () => {
                sel = parseInt(star.dataset.value);
                stars.forEach((s, i) => s.className = i < sel ? 'fa-solid fa-star star-input selected' : 'fa-regular fa-star star-input');
            });
        });

        if (textarea && charNum) textarea.addEventListener('input', () => { charNum.textContent = textarea.value.length; });

        if (btnSub) btnSub.addEventListener('click', () => {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario) return;
            if (sel === 0) { alert('⭐ Por favor selecciona una calificación.'); return; }
            const texto = textarea?.value.trim();
            if (!texto) { alert('✍️ Escribe tu experiencia antes de publicar.'); return; }
            const nombre = usuario.nombre ? `${usuario.nombre}${usuario.apellido ? ' ' + usuario.apellido : ''}` : usuario.correo;
            const nueva = { id_usuario: usuario.id_usuario, nombre, fecha: fechaCompleta(new Date()), estrellas: sel, texto };
            const all = getReviews(); all.unshift(nueva); saveReviews(all);
            sel = 0;
            stars.forEach(s => s.className = 'fa-regular fa-star star-input');
            if (textarea) textarea.value = '';
            if (charNum)  charNum.textContent = '0';
            alert('✅ ¡Gracias por tu reseña!');
            renderResenasPage();
        });
    })();

    document.addEventListener('authChanged', () => {
        if (viewResenas && viewResenas.classList.contains('active')) renderFormEstado();
    });

    // ==========================================
    // FOOTER
    // ==========================================

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    const footerLinkHome     = document.getElementById('footer-link-home');
    const footerLinkBook     = document.getElementById('footer-link-book');
    const footerLinkReviews  = document.getElementById('footer-link-reviews');
    const footerLinkReservas = document.getElementById('footer-link-reservas');

    if (footerLinkHome)     footerLinkHome.addEventListener('click',     e => { e.preventDefault(); showHomeTab(); });
    if (footerLinkBook)     footerLinkBook.addEventListener('click',     e => { e.preventDefault(); showBookTab(); });
    if (footerLinkReviews)  footerLinkReviews.addEventListener('click',  e => { e.preventDefault(); showResenasTab(); });
    if (footerLinkReservas) footerLinkReservas.addEventListener('click', e => {
        e.preventDefault();
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario && usuario.id_usuario) showReservasTab();
        else if (authModal) authModal.classList.add('show');
    });

    // ==========================================
    // 10. INICIALIZACIÓN
    // ==========================================
    updateAuthUI();
    updateWizardUI();
    if (datePicker) datePicker.min = getTodayString();
    actualizarHorasDisponibles();

    fetch('https://proyecto-oasis-ar.onrender.com')
    .then(res => res.json())
    .then(data => {
        console.log('Reservas desde backend:', data);
    })
    .catch(err => console.error('Error:', err));

});