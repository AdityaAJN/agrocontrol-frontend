const API_BASE = "https://agrocontrol-backend-ofyy.onrender.com";




const cropContainer = document.getElementById("crop-list");

if (cropContainer) {
    fetch(`${API_BASE}/api/crops/`)
        .then(response => response.json())
        .then(data => {
            data.forEach(crop => {
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


    <button onclick="buyCrop(${crop.id})">
        Buy
    </button>
`;

                cropContainer.appendChild(card);
            });
        });
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

