import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler.js";
import { prisma } from "../../database/prismaClient.js";

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdToUpdate = req.params.id as string;
        const { role } = req.body;

        if (!role) {
            throw new AppError("Missing role in request body", 400);
        }

        if (!["VIEWER", "ANALYST", "ADMIN"].includes(role)) {
            throw new AppError("Invalid role. Must be VIEWER, ANALYST, or ADMIN", 400);
        }

        if (req.user?.userId === userIdToUpdate) {
            throw new AppError("You cannot change your own role.", 403);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userIdToUpdate },
            data: { role },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        res.status(200).json({ 
            message: `User promoted to ${role} successfully`, 
            data: updatedUser 
        });

    } catch (error) {
        next(error);
    }
}