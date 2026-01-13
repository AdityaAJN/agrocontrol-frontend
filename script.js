const API_BASE = "https://agrocontrol-backend-ofyy.onrender.com";
let allCrops = [];




const cropContainer = document.getElementById("crop-list");

if (cropContainer) {
    fetch(`${API_BASE}/api/crops/`)
    .then(response => response.json())
    .then(data => {
        allCrops = data;
        renderCrops(allCrops);
    });
function renderCrops(crops) {
    const container = document.getElementById("crop-list");
    container.innerHTML = "";

    crops.forEach(crop => {
        const card = document.createElement("div");
        card.className = "crop-card";

        card.innerHTML = `
            <img src="${API_BASE}${crop.image}" alt="${crop.name}" class="crop-image">

            <h3>${crop.name}</h3>

            <p class="price">
                &#8377; ${crop.price} / kg
            </p>

            <label>
                Quantity (kg):
                <input
                    type="number"
                    min="1"
                    value="1"
                    class="qty-input"
                    id="qty-${crop.id}"
                    oninput="updateTotal(${crop.id}, ${crop.price})"
                >
            </label>

            <p class="total-price" id="total-${crop.id}">
                Total: &#8377; ${crop.price}
            </p>

            <p>${crop.description}</p>

           <div class="btn-group">
    <button onclick="addToCart(${crop.id})">Add to Cart</button>
    <button onclick="buyCrop(${crop.id})">Buy</button>
</div>

        `;

        container.appendChild(card);
    });
}
}




function login() {
    alert("login button clicked");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Login successful");
            window.location.href = "index.html";
        } else {
            alert("Login failed");
        }
    });
}

function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${API_BASE}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(() => {
        alert("Registration successful");
        window.location.href = "login.html";
    });
}
function buyCrop(cropId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first");
        return;
    }

    const qtyInput = document.getElementById(`qty-${cropId}`);
    const quantity = qtyInput ? qtyInput.value : 1;

    fetch(`${API_BASE}/api/buy/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            crop_id: cropId,
            quantity: quantity
        })
    })
    .then(res => res.json())
    .then(() => {
        alert(`Order placed for ${quantity} kg`);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", login);
    }
});
function updateTotal(cropId, pricePerKg) {
    const qtyInput = document.getElementById(`qty-${cropId}`);
    const totalEl = document.getElementById(`total-${cropId}`);

    const quantity = parseInt(qtyInput.value) || 1;
    const total = quantity * pricePerKg;

    totalEl.innerHTML = `Total: &#8377; ${total}`;
}

function searchCrops() {
    const input = document.getElementById("search-input").value.toLowerCase();

    const filtered = allCrops.filter(crop =>
        crop.name.toLowerCase().includes(input)
    );

    renderCrops(filtered);
}
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(cropId) {
    const crop = allCrops.find(c => c.id === cropId);
    const qty = parseInt(document.getElementById(`qty-${cropId}`).value) || 1;

    const existing = cart.find(item => item.id === cropId);

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: crop.id,
            name: crop.name,
            price: crop.price,
            quantity: qty
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();

    alert(`${crop.name} added to cart`);
}
function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    if (!countEl) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
}
updateCartCount();
function loadCartPage() {
    const cartContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!cartContainer) return;

    cartContainer.innerHTML = "";
    let grandTotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalEl.textContent = "";
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
    <label>
        <input 
            type="checkbox" 
            class="cart-checkbox" 
            data-id="${item.id}" 
            checked 
            onchange="updateSelectedTotal()"
        >
        <strong>${item.name}</strong>
    </label>

    <p>Price: &#8377; ${item.price} / kg</p>
    <p>Quantity: ${item.quantity} kg</p>
    <p><strong>Total: &#8377; ${itemTotal}</strong></p>
    <hr>
`;


        cartContainer.appendChild(div);
    });

    totalEl.innerHTML = `Grand Total: &#8377; ${grandTotal}`;
}


document.addEventListener("DOMContentLoaded", loadCartPage);
updateSelectedTotal();
function buyFromCart() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first to place order");
        window.location.href = "login.html";
        return;
    }

    const checkboxes = document.querySelectorAll(".cart-checkbox");
    const selectedIds = [];

    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedIds.push(parseInt(cb.dataset.id));
        }
    });

    if (selectedIds.length === 0) {
        alert("Please select at least one item");
        return;
    }

    alert("Order placed for selected items!");

    // Remove only selected items
    cart = cart.filter(item => !selectedIds.includes(item.id));
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    loadCartPage();
}

function updateSelectedTotal() {
    const checkboxes = document.querySelectorAll(".cart-checkbox");
    let total = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const itemId = parseInt(cb.dataset.id);
            const item = cart.find(i => i.id === itemId);
            total += item.price * item.quantity;
        }
    });

    const totalEl = document.getElementById("cart-total");
    totalEl.innerHTML = `Selected Total: &#8377; ${total}`;
}
