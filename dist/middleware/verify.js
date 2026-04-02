import jwt from 'jsonwebtoken';
import { getEnvVar } from "../utils/env.js";
export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies["access-token"];
        if (!token) {
            return res.status(401).json({ message: "You are not logged in. Please log in to get access." });
        }
        const secretKey = getEnvVar("JWT_SECRET");
        const decoded = jwt.verify(token, secretKey);
        req.user;
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=verify.js.map