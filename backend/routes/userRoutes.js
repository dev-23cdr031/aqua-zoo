const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration Successful",
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
});
// Login User
router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        res.status(200).json({
            message: "Login Successful",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
});
module.exports = router;