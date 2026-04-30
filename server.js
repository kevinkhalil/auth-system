const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const USERS_FILE = "users.json";
const JWT_SECRET = "mysecretkey";

function loadUsers() {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.get("/", (req, res) => {
    res.send("Auth system server is running");
});

app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    const users = loadUsers();

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now(),
        email: email,
        password: hashedPassword
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const users = loadUsers();

    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
        message: "Login successful",
        token: token
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = user;
        next();
    });
}

app.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Welcome to your protected profile",
        user: req.user
    });
});

app.listen(4000, () => {
    console.log("Server running on http://127.0.0.1:4000");
});