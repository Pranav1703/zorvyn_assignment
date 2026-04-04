import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { getEnvVar } from "../../utils/env.js";
import { AppError } from "../../middleware/errorHandler.js";
import { isValidEmail } from "../../utils/validation.js";


export const signUp = async(req: Request, res: Response, next: NextFunction) => {
    try {

        const {username,email, password} = req.body
        if (!username || !email || !password) {
            throw new AppError("Missing required fields: username, email, password", 400);
        }
        
        if (!isValidEmail(email)) {
            throw new AppError("Invalid email format", 400);
        }

        const check = await prisma.user.findFirst({
            where:{
                email
            }
        })
        if(check) throw new AppError(`User with ${email} already exists.`, 409);
        
        const hashedPass = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data:{
                username,
                email,
                password: hashedPass,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        })

        const secretKey = getEnvVar("JWT_SECRET")

        const token = jwt.sign({
            userId: newUser.id,
            role: newUser.role,
            username: newUser.username
        }, secretKey)
        
        res.cookie("access-token", token,{
            maxAge: 15 * 60 * 60,
            httpOnly: true,
        })

        res.status(201).json({message: "User created and logged in.", userId: newUser.id})
    } catch (error) {
        next(error)
    }
}

export const login = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body
        if(!email || !password) throw new AppError("Missing email or password in request body", 400);
        
        const check = await prisma.user.findUnique({
            where:{
                email
            },
        })
        if(!check) throw new AppError(`User with ${email} doesn't exist.`, 401)

        if (!check.isActive) {
            return res.status(403).json({ 
                message: "Your account is inactive." 
            });
        }
    
        const compare = await bcrypt.compare(password, check.password)
        if(!compare) throw new AppError("Incorrect password.", 401);
        
        const secretKey = getEnvVar("JWT_SECRET")
        const token = jwt.sign({
            userId: check.id,
            role: check.role,
            username: check.username
        }, secretKey)

       res.cookie("access-token", token,{
            maxAge: 60 * 60 * 1000, //1 hr
            httpOnly: true,
        })

        res.status(200).json({message: "Logged IN.", userId: check.id})
    } catch (error) {
        next(error)
    }
}

// since there is no frontend i didnt create refresh tokens. 

export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie('access-token',{
            httpOnly: true
        })

        res.status(200).json({message: "logged Out."})
    } catch (error) {
        next(error)
    }
}

export const toggleUserStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { isActive } = req.body; 

    if(isActive === undefined) {
        throw new AppError("Missing isActive in request body", 400);
    }

    if(typeof isActive !== 'boolean') throw new AppError("isActive should be boolean", 400);
    if (id === req.user?.userId) throw new AppError("Cannot deactivate yourself", 400);

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive },
        omit: {
            password: true
        }
    });

    res.status(200).json({
        message: `User status updated to ${isActive ? 'Active' : 'Inactive'}`,
        user: updatedUser
    });
};