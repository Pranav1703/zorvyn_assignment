import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { getEnvVar } from "../utils/env.js";

export const authenticate = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["access-token"]
        if (!token) {
            return res.status(401).json({ message: "You are not logged in. Please log in to get access." });
        }
        
        const secretKey = getEnvVar("JWT_SECRET");
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role
        }

        next()

    } catch (error) {
        next(error)
    }
}