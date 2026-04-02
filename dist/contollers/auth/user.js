import { prisma } from "../../database/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { getEnvVar } from "../../utils/env.js";
export const signUp = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (!["ADMIN", "ANALYST", "VIEWER"].includes(role))
            return res.status(400).json({ message: "role should be in (ADMIN, ANALYST, VIEWER)" });
        const check = await prisma.user.findFirst({
            where: {
                email
            }
        });
        if (check)
            return res.status(403).json({ message: `user with ${email} already exists.` });
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPass,
                role
            }
        });
        const secretKey = getEnvVar("JWT_SECRET");
        const token = jwt.sign({
            userId: newUser.id,
            role: newUser.role,
            userName: newUser.username
        }, secretKey);
        res.cookie("access-token", token, {
            maxAge: 15 * 60 * 60,
            httpOnly: true,
        });
        res.sendStatus(201);
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(401).json({ message: "Missing email or password in request body" });
        const check = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!check)
            return res.status(400).json({ message: `user with ${email} doesnt exist.` });
        const compare = await bcrypt.compare(password, check.password);
        if (!compare)
            return res.status(400).json({ message: "Incorrect password." });
        const secretKey = getEnvVar("JWT_SECRET");
        const token = jwt.sign({
            userId: check.id,
            role: check.role,
            username: check.username
        }, secretKey);
        res.cookie("access-token", token, {
            maxAge: 60 * 60 * 1000, //1 hr
            httpOnly: true,
        });
        res.sendStatus(200);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=user.js.map