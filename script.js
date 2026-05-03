const API_URL = "https://auth-system-6205.onrender.com";

let token = localStorage.getItem("token") || "";

function showMessage(message) {
    document.getElementById("output").innerText = message;
}

async function register() {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    showMessage(data.message);
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
        token = data.token;
        localStorage.setItem("token", token);
        showMessage("Logged in successfully!");
    } else {
        showMessage(data.message);
    }
}

async function getProfile() {
    const res = await fetch(API + "/profile", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    if (data.user) {
        showMessage(`Welcome ${data.user.email}`);
    } else {
        showMessage(data.message);
    }
}

function logout() {
    token = "";
    localStorage.removeItem("token");
    showMessage("Logged out successfully!");
}