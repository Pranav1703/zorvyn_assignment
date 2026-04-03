import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient.js";
import type { TransactionWhereInput } from "../../generated/prisma/models.js";

export const getFinanceOverviewSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const baseWhere: TransactionWhereInput = {
            isDeleted: false,
        };

        const [incomeAgg, expenseAgg] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { ...baseWhere, type: "INCOME" }
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { ...baseWhere, type: "EXPENSE" }
            })
        ]);

        const totalIncome = incomeAgg._sum.amount || 0;
        const totalExpenses = expenseAgg._sum.amount || 0;

        res.status(200).json({
            data: {
                totalIncome,
                totalExpenses,
                netBalance: totalIncome - totalExpenses
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryTotals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryGroup = await prisma.transaction.groupBy({
            by: ['category', 'type'],
            _sum: { amount: true },
            where:{
                isDeleted: false,
            }
        });

        const formattedCategories = categoryGroup.map(c => ({
            category: c.category,
            type: c.type,
            total: c._sum!.amount || 0
        }));

        res.status(200).json({ data: formattedCategories });
    } catch (error) {
        next(error);
    }
};

export const getRecentActivitySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const takeLimit = parseInt(req.query.limit as string) || 5;

        const recentActivity = await prisma.transaction.findMany({
            where:{
                isDeleted: false,
            },
            orderBy: { date: 'desc' },
            take: takeLimit
        });

        res.status(200).json({ data: recentActivity });
    } catch (error) {
        next(error);
    }
};

export const getMonthlyTrendsSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const monthsToFetch = parseInt(req.query.months as string) || 3;
        
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - monthsToFetch);

        const recentTrendData = await prisma.transaction.findMany({
            where: {
                isDeleted: false,
                date: { gte: dateLimit }
            },
            select: { amount: true, type: true, date: true } 
        });

        const monthlyTrends = recentTrendData.reduce((acc: Record<string, { income: number, expense: number }>, curr) => {
            const monthKey = curr.date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            if (!acc[monthKey]) {
                acc[monthKey] = { income: 0, expense: 0 };
            }

            if (curr.type === 'INCOME') {
                acc[monthKey].income += curr.amount;
            } else if (curr.type === 'EXPENSE') {
                acc[monthKey].expense += curr.amount;
            }

            return acc;
        }, {});

        res.status(200).json({ data: monthlyTrends });
    } catch (error) {
        next(error);
    }
};