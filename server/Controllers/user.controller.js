import dotenv from "dotenv";
import User from "../Model/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

export const register = async (req, res) => {
    try {
        const user = req.body;

        const userExists = await User.findOne({ email: user.email });
        if (userExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        user.createdAt = new Date().toISOString();
        const newUser = new User(user);
        await newUser.save();
        const userResponse = newUser.toObject();
        delete userResponse.password;
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" });

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

