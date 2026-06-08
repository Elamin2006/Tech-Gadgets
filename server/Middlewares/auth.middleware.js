import {promisify} from "util";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../Model/User.model.js";
dotenv.config();

const authentication = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

    try {
    const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token or token has expired. Please login again.',
    });
  }
}

export default authentication;