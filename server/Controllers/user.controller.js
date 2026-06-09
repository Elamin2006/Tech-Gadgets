import dotenv from "dotenv";
import User from "../Model/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import ApiError from "../Utils/ApiError.js";

dotenv.config();

export const register = asyncHandler(async (req, res) => {

    const user = req.body;

    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
        throw new ApiError("User with this email already exists", 409);
    }

    user.createdAt = new Date().toISOString();
    const newUser = new User(user);
    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: userResponse
    });


});

export const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError("Email and password are required", 400);
    }

    let user = await User.findOne({ email });
    if (!user) {
        throw new ApiError("Invalid email or password", 400);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid email or password", 400);
    }

    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" });

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user.toObject()
    });


});

