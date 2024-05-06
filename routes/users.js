import { Router } from "express";
import userData from "../data/users.js";
import helpers from "../helpers.js";

const router = Router();

// Profile page after login
router.get("/profile", async (req, res) => {
    if (!req.session.userId) {
        res.redirect("/users/login");
    }
    const userLoggedIn = !!req.session.userId;
    try {
        const user = await userData.getUserById(req.session.userId);
        res.render("profile/profile", {
            title: "Profile",
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            favoriteGenres: user.favoriteGenres.join(', '),
            listenedSongs: user.listenedSongs,
            reviewsPosted: user.reviewsPosted,
            userLoggedIn: userLoggedIn
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login page
router.get("/login", (req, res) => {
    const userLoggedIn = !!req.session.userId;
    res.render("login/login", { title: "Login", userLoggedIn});
});

// Redirect to profile upon successful login or registration
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = await userData.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const isValid = await userData.validatePassword(user._id, password);
        if (isValid) {
            req.session.userId = user._id; // Set user ID in session
            res.json({ success: true });
        } else {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Registration page
router.get("/register", (req, res) => {
    const userLoggedIn = !!req.session.userId;
    res.render("register/register", { title: "Register", userLoggedIn });
});

// Registration form submission
router.post("/register", async (req,res) => {
    try {
        let { firstName, lastName, email, password, favoriteGenres } = req.body;
        favoriteGenres = favoriteGenres.split(",").map(genre => genre.trim());
        const newUser = await userData.create([
            firstName,
            lastName,
            email,
            password,
            favoriteGenres
        ]);
        if (newUser) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'Registration failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });;
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/users/login");
    });
});

export default router;