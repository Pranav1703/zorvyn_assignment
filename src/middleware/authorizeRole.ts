import type { NextFunction, Request, Response } from "express";

export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({ message: "Unauthorized: User role not found" });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                message: `Forbidden: Requires one of roles [${allowedRoles.join(", ")}]` 
            });
        }

        next();
    };
};