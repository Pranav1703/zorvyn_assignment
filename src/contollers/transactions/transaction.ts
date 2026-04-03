import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient.js";
import type { TransactionType } from "../../generated/prisma/client.js";

export const getAllTransactions = async(req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page-1) * limit;

        const { type, category, startDate, endDate } = req.query;

        const where: any = {
            deletedAt: null
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

        if(!amount || !type || !category || !date) return res.status(400).json({message: "missing required fields"})
        if (!["INCOME","EXPENSE"].includes(type)) return res.status(400).json({message: "type should be either 'INCOME' or 'EXPENSE'"})
        const newTransaction = await prisma.transaction.create({
            data:{
                amount: Number(amount),
                type,
                category,
                date: new Date(date),
                notes: notes? notes: undefined,
                userId: req.user?.userId!
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
        if(updates.amount) updateData.amount = Number(updates.amount)
        if(updates.type) updateData.type = updates.type
        if(updates.category) updateData.category = updates.category
        if(updates.date) updateData.date= new Date(updates.date)
        if(updates.notes) updateData.notes = updates.notes

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
            data:{
                deletedAt: new Date()
            }
        });

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        next(error);
    }
}