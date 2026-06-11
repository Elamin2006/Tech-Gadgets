import apiError from "../Utils/ApiError.js";

export const allowedTo = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {
            throw new ApiError("Authentication required before authorization", 401);
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError("You do not have permission to perform this action", 403);
        }

        next();
    };
};