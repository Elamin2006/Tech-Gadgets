import User from "../Model/User.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../Utils/ApiError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateResetCode, buildResetMailOptions, sendMail } from "../Services/email.js";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
};

// register
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

// login
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

    const token = generateAccessToken(user);
    
    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user.toObject()
    });


});

export const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError("No user with this email", 404);
    }

    const resetCode = generateResetCode();
    if (process.env.NODE_ENV === 'development') {
    console.log(`\n Reset Code for ${email} is: ${resetCode}\n`);
}

    user.passwordResetCode = crypto.createHash("sha256").update(resetCode).digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;
    await user.save();

    const mailOptions = buildResetMailOptions(email, resetCode);

    await sendMail(mailOptions);

    res.status(200).json({
        success: true,
        message: "Password reset code sent to email"
    });
});

// 2. Verify Reset Code
export const verifyResetCode = asyncHandler(async (req, res, next) => {
  
    const { email, resetCode } = req.body;
    if (!email || !resetCode) {
      throw new ApiError('Email and reset code are required', 400);
    }

    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    const user = await User.findOne({
      email,
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() }, 
    });

    if (!user) throw new ApiError('Reset code is invalid or has expired', 400);

    user.passwordResetVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Reset code verified successfully' });
  
});

// 3. Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
  
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new ApiError('Email and new password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) throw new ApiError('User not found', 404);

    if (!user.passwordResetVerified) throw new ApiError('Reset code not verified yet', 400);

    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();

    const token = generateAccessToken(user);

    res.status(200).json({ success: true, message: 'Password reset successfully', token });
  
});