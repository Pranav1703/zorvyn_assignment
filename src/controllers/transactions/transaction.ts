import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient.js";
import type { TransactionType } from "../../generated/prisma/client.js";
import { AppError } from "../../middleware/errorHandler.js";

export const getAllTransactions = async(req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page-1) * limit;

        const { type, category, startDate, endDate } = req.query;
        if (type && !["INCOME","EXPENSE"].includes(type as string)) throw new AppError("'type' should be either 'INCOME' or 'EXPENSE'", 400);
        const where: any = {
            isDeleted: false,
        };

        if (type) where.type = type as TransactionType;
        if (category) where.category = category as string;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }
        
        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' }
            }),
            prisma.transaction.count({ where })
        ]);

        res.status(200).json({
            data: transactions,
            metadata: { 
                total, 
                page, 
                limit, 
                totalPages: Math.ceil(total / limit) 
            }
        });

    } catch (error) {
        next(error)
    }
}

export const createTransaction = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            amount,
            type,
            category,
            date,
            notes,
        } = req.body

        if(!amount || !type || !category || !date) throw new AppError("Missing required fields", 400);
        if (!["INCOME","EXPENSE"].includes(type)) throw new AppError("Type should be either 'INCOME' or 'EXPENSE'", 400);

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new AppError("Amount must be a valid positive number", 400);
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new AppError("Invalid date format", 400);
        }

        const newTransaction = await prisma.transaction.create({
            data:{
                amount: numericAmount,
                type,
                category,
                date: parsedDate,
                notes: notes ? notes : undefined,
            }
        })
        res.status(201).json({message: "new transaction created", data: newTransaction})

    } catch (error) {
        next(error)
    }
}

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id  = req.params.id as string;
        const updates = req.body;

        const updateData: any = {}
        if (updates.amount !== undefined) {
            const numericAmount = Number(updates.amount);

            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new AppError("Amount must be a valid positive number", 400);
            }
            updateData.amount = numericAmount;
        }

        if (updates.type !== undefined) {
            if (!["INCOME", "EXPENSE"].includes(updates.type)) {
                throw new AppError("Type should be either 'INCOME' or 'EXPENSE'", 400);
            }
            updateData.type = updates.type;
        }

        if (updates.category !== undefined) {
            updateData.category = updates.category;
        }

        if (updates.date !== undefined) {

            const parsedDate = new Date(updates.date);
            if (isNaN(parsedDate.getTime())) {
                throw new AppError("Invalid date format", 400);
            }
            updateData.date = parsedDate;
        }

        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }
        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ message: "Transaction updated", data: updatedTransaction });
    } catch (error) {
        next(error);
    }
}

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id  = req.params.id as string;

        await prisma.transaction.update({
            where: { id },
            data: { isDeleted: true }
        });

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        next(error);
    }
}