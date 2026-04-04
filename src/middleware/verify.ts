import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { getEnvVar } from "../utils/env.js";
import { prisma } from "../database/prismaClient.js";
import { AppError } from "./errorHandler.js";

export const authenticate = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["access-token"]
        if (!token) throw new AppError("You are not logged in. Please log in to get access-token.",401)
        
        const secretKey = getEnvVar("JWT_SECRET");
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) throw new AppError("User account doesn't exist anymore.",403)

        if (!user.isActive) throw new AppError("account is inActive.",403)

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