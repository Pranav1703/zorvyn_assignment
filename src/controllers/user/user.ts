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
        if(check) return res.status(403).json({message: `user with ${email} already exists.`})
        
        const hashedPass = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data:{
                username,
                email,
                password: hashedPass,
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

        res.sendStatus(201)
    } catch (error) {
        next(error)
    }
}

export const login = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body
        if(!email || !password) return res.status(401).json({message: "Missing email or password in request body"})
        
        const check = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!check) return res.status(400).json({message: `user with ${email} doesnt exist.`})

        const compare = await bcrypt.compare(password, check.password)
        if(!compare) return res.status(400).json({message: "Incorrect password."})
        
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

        res.sendStatus(200)
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

