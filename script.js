const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.querySelector('.cart-modal');
const closeButton = document.querySelector('.close-button');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const checkoutButton = document.getElementById('checkout-button');
const cartCount = document.querySelector('.cart-count');

const hamburgerButton = document.querySelector('.hamburger-menu');
const mainNav = document.querySelector('.main-nav');

// Elementos de la UI de autenticación en la sección "Mi Cuenta"
const authUIguest = document.getElementById('auth-ui-guest');
const showLoginRegisterModalAccountButton = document.getElementById('show-login-register-modal-account');
const userInfoDisplay = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const logoutButton = document.getElementById('logout-button');

// Elementos del nuevo modal de Registro/Inicio de Sesión
const authModal = document.getElementById('auth-modal');
const closeButtonModal = document.querySelector('.close-button-modal');
const authModalTitle = document.getElementById('auth-modal-title');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterFormLink = document.getElementById('show-register-form');
const showLoginFormLink = document.getElementById('show-login-form');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');


let cart = []; // El carrito actual (se guardará por usuario)
let currentUser = null; // Almacenará { email: '...', password: '...' }

// Almacena datos de usuarios (email, password, cart)
// Formato: { "email@example.com": { password: "hashed_password", cart: [] }, ... }
let simulatedUsersDB = JSON.parse(localStorage.getItem('simulatedUsersDB')) || {};


// --- Funcionalidad del Carrito ---

addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (!currentUser) { // Si no hay usuario logueado
            authModal.style.display = 'flex'; // Mostrar el modal de login/registro
            authModalTitle.textContent = 'Iniciar Sesión / Registrarse'; // Asegurar el título genérico
            loginForm.style.display = 'block'; // Mostrar login por defecto
            registerForm.style.display = 'none';

            // Guardar el producto que el usuario intentó añadir para añadirlo después del login
            localStorage.setItem('pendingProductToAdd', JSON.stringify({
                id: this.closest('.product-item').dataset.productId,
                name: this.closest('.product-item').dataset.productName,
                price: parseFloat(this.closest('.product-item').dataset.productPrice)
            }));
            return; // Detener la ejecución para esperar el login
        }

        // Si ya hay un usuario logueado, añadir directamente
        const productItem = this.closest('.product-item');
        const productId = productItem.dataset.productId;
        const productName = productItem.dataset.productName;
        const productPrice = parseFloat(productItem.dataset.productPrice);

        addProductToCart(productId, productName, productPrice);
    });
});

cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

checkoutButton.addEventListener('click', () => {
    if (!currentUser) {
        alert("Para finalizar la compra, por favor inicia sesión o regístrate.");
        authModal.style.display = 'flex'; // Mostrar modal de login/registro
        authModalTitle.textContent = 'Iniciar Sesión / Registrarse';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalAmount > 0) {
        // Simulación de redirección a PayPal
        const paypalLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=tu_email@example.com&currency_code=USD&amount=${totalAmount.toFixed(2)}&item_name=Compra%20en%20JRS%20Custom%20Gaming`;
        window.open(paypalLink, '_blank');

        alert(`Redirigiendo para pagar $${totalAmount.toFixed(2)}.`);
        
        cart = []; // Vaciar carrito después de una supuesta compra exitosa
        updateCartDisplay();
        updateCartCount();
        saveCartData(); // Guardar el carrito vacío
        cartModal.style.display = 'none';

    } else {
        alert("El carrito está vacío. Agrega productos para comprar.");
    }
});


function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    }

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-item" data-product-id="${item.id}">X</button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
        total += item.price * item.quantity;
    });

    cartTotalPriceElement.textContent = total.toFixed(2);

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            removeItemFromCart(productId);
        });
    });
}

function removeItemFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateCartCount();
    saveCartData(); // Guardar cambios en el carrito
}


function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (totalItems > 0) {
        cartIcon.style.display = 'flex'; // Mostrar el icono del carrito si hay ítems
    } else {
        cartIcon.style.display = 'none'; // Ocultar si está vacío
    }
}

// --- Funcionalidad del Menú Hamburguesa ---

hamburgerButton.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburgerButton.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (mainNav.classList.contains('open')) {
            mainNav.classList.remove('open');
            hamburgerButton.classList.remove('open');
        }
    });
});


// --- Funcionalidad de Registro/Login (Simulado) ---

// Botón para mostrar el modal de login/registro desde la sección "Mi Cuenta"
showLoginRegisterModalAccountButton.addEventListener('click', () => {
    authModal.style.display = 'flex';
    authModalTitle.textContent = 'Iniciar Sesión';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginEmailInput.value = ''; // Limpiar campos al abrir
    loginPasswordInput.value = '';
    registerEmailInput.value = '';
    registerPasswordInput.value = '';
});

// Enlaces para cambiar entre formularios de login y registro
showRegisterFormLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authModalTitle.textContent = 'Registrarse';
    registerEmailInput.value = ''; // Limpiar campos
    registerPasswordInput.value = '';
});

showLoginFormLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    authModalTitle.textContent = 'Iniciar Sesión';
    loginEmailInput.value = ''; // Limpiar campos
    loginPasswordInput.value = '';
});

// Manejar envío del formulario de Registro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value.trim();

    if (email === '' || password === '') {
        alert('Por favor, rellena todos los campos.');
        return;
    }

    if (simulatedUsersDB[email]) {
        alert('Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión.');
        return;
    }

    // En un sistema real, aquí la contraseña se hashearía
    simulatedUsersDB[email] = { password: password, cart: [] }; // Almacenar contraseña en texto plano para la simulación
    localStorage.setItem('simulatedUsersDB', JSON.stringify(simulatedUsersDB));
    
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    // Después del registro, mostramos el formulario de login y llenamos el email
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authModalTitle.textContent = 'Iniciar Sesión';
    loginEmailInput.value = email;
    loginPasswordInput.value = ''; // La contraseña debe ser reingresada
});

// Manejar envío del formulario de Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (email === '' || password === '') {
        alert('Por favor, rellena todos los campos.');
        return;
    }

    const user = simulatedUsersDB[email];

    if (!user || user.password !== password) { // En un sistema real, se compararía el hash de la contraseña
        alert('Correo electrónico o contraseña incorrectos.');
        return;
    }

    // Login exitoso
    currentUser = { email: email, name: email.split('@')[0] }; // Usar el email como ID y la parte antes del @ como nombre
    localStorage.setItem('loggedInUser', JSON.stringify(currentUser)); // Guardar sesión
    
    alert(`¡Bienvenido, ${currentUser.name}!`);
    authModal.style.display = 'none'; // Cerrar el modal

    updateAuthUI(); // Actualizar la interfaz de usuario
    loadCartData(); // Cargar el carrito del usuario logueado

    const pendingProduct = JSON.parse(localStorage.getItem('pendingProductToAdd'));
    if (pendingProduct) {
        addProductToCart(pendingProduct.id, pendingProduct.name, pendingProduct.price);
        localStorage.removeItem('pendingProductToAdd'); // Limpiar el producto pendiente
    }
});


logoutButton.addEventListener('click', () => {
    console.log("Cerrando sesión...");
    currentUser = null;
    cart = []; // Vaciar carrito al cerrar sesión
    localStorage.removeItem('loggedInUser'); // Eliminar sesión persistente
    updateCartDisplay();
    updateCartCount();
    updateAuthUI(); // Actualizar la interfaz de usuario
    console.log("Sesión cerrada y carrito limpiado.");
    alert("Has cerrado sesión.");
});

// Función para añadir producto al carrito (usada internamente)
function addProductToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
    }

    updateCartDisplay();
    updateCartCount();
    saveCartData(); // Guardar el carrito tras cualquier modificación
    // Opcional: alert(`"${productName}" añadido al carrito.`);
}


// Actualiza la visibilidad de los botones de autenticación y la información del usuario
function updateAuthUI() {
    if (currentUser) {
        authUIguest.style.display = 'none'; // Oculta el bloque de invitado
        userInfoDisplay.style.display = 'block'; // Muestra la info del usuario
        usernameDisplay.textContent = currentUser.name;
    } else {
        authUIguest.style.display = 'block'; // Muestra el bloque de invitado
        userInfoDisplay.style.display = 'none'; // Oculta la info del usuario
        usernameDisplay.textContent = '';
    }
    // Asegurarse de que el modal de auth está oculto
    authModal.style.display = 'none';
}

// Función para "guardar" los datos del carrito
function saveCartData() {
    if (currentUser && simulatedUsersDB[currentUser.email]) {
        simulatedUsersDB[currentUser.email].cart = cart; // Guardar el carrito en los datos del usuario simulado
        localStorage.setItem('simulatedUsersDB', JSON.stringify(simulatedUsersDB)); // Actualizar usuarios en localStorage
        console.log(`Carrito guardado localmente para el usuario "${currentUser.name}" (${currentUser.email}):`, JSON.stringify(cart));
    } else {
        console.log("No hay usuario logueado. El carrito no se guardará de forma persistente.");
    }
}

// Función para "cargar" los datos del carrito
function loadCartData() {
    if (currentUser && simulatedUsersDB[currentUser.email]) {
        cart = simulatedUsersDB[currentUser.email].cart || []; // Cargar carrito del usuario simulado
        console.log(`Carrito cargado localmente para el usuario "${currentUser.name}" (${currentUser.email}):`, JSON.stringify(cart));
    } else {
        cart = []; // Si no hay usuario logueado, el carrito está vacío al inicio
        console.log("No hay usuario logueado. Carrito vacío cargado.");
    }
    updateCartDisplay();
    updateCartCount();
}


// Cerrar modal de login/registro
closeButtonModal.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target == authModal) {
        authModal.style.display = 'none';
    }
});


// --- Desplazamiento Suave ---

document.querySelectorAll('.products-menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Al cargar la página, intentar cargar la sesión y el carrito
function initializeApp() {
    // Cargar la sesión guardada si existe
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        console.log(`Sesión restaurada para el usuario "${currentUser.name}".`);
        updateAuthUI(); // Actualizar la interfaz de usuario
        loadCartData(); // Cargar el carrito del usuario logueado
    } else {
        // Si no hay sesión guardada, el usuario no está logueado
        currentUser = null;
        cart = []; // Asegurar que el carrito esté vacío si no hay sesión
        console.log("No hay sesión guardada. El usuario no está logueado.");
        updateAuthUI(); // Actualizar la interfaz de usuario (mostrar "Iniciar Sesión / Registrarse")
        updateCartDisplay(); // Mostrar carrito vacío
        updateCartCount(); // Actualizar contador
    }
    updateCartCount(); // Asegurarse de que el icono del carrito esté correcto al inicio
}

// Ejecutar la función de inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);