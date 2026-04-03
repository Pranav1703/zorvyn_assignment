//this is a standalone script to seed databse with admin user.

import bcrypt from "bcryptjs"
import { prisma } from "./prismaClient.js"
import { TransactionType } from "../generated/prisma/enums.js"

async function main() {
    const adminUsername = "AdminUser"
    const adminEmail = "admin@zorvyn.in"
    const hashedPass = await bcrypt.hash("admin123",10)

    console.log("seeding admin user into db...")

    const admin = await prisma.user.upsert({
        where:{
            email: adminEmail,
        },
        create:{
            username: adminUsername,
            email: adminEmail,
            password: hashedPass,
            role: "ADMIN"
        },
        update:{}
    })
    const today = new Date();
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    console.log("Deleting old transactions if they exist...");
    await prisma.transaction.deleteMany({
        where: { userId: admin.id }
    });

    console.log("Seeding new transactions...");
    const transactionData = [
        // --- THIS MONTH ---
        { amount: 6000, type: TransactionType.INCOME, category: "Salary", date: today, notes: "Current month salary", userId: admin.id },
        { amount: 1500, type: TransactionType.EXPENSE, category: "Rent", date: today, notes: "Monthly rent", userId: admin.id },
        { amount: 400, type: TransactionType.EXPENSE, category: "Groceries", date: today, notes: "Whole Foods", userId: admin.id },
        { amount: 150, type: TransactionType.EXPENSE, category: "Utilities", date: today, notes: "Internet and Power", userId: admin.id },

        // --- 1 MONTH AGO ---
        { amount: 6000, type: TransactionType.INCOME, category: "Salary", date: oneMonthAgo, notes: "Last month salary", userId: admin.id },
        { amount: 800, type: TransactionType.INCOME, category: "Freelance", date: oneMonthAgo, notes: "Web dev side project", userId: admin.id },
        { amount: 1500, type: TransactionType.EXPENSE, category: "Rent", date: oneMonthAgo, notes: "Monthly rent", userId: admin.id },
        { amount: 600, type: TransactionType.EXPENSE, category: "Groceries", date: oneMonthAgo, notes: "Walmart and Trader Joes", userId: admin.id },
        { amount: 200, type: TransactionType.EXPENSE, category: "Entertainment", date: oneMonthAgo, notes: "Movie tickets and dinner", userId: admin.id },

        // --- 2 MONTHS AGO ---
        { amount: 6000, type: TransactionType.INCOME, category: "Salary", date: twoMonthsAgo, notes: "Salary", userId: admin.id },
        { amount: 1500, type: TransactionType.EXPENSE, category: "Rent", date: twoMonthsAgo, notes: "Monthly rent", userId: admin.id },
        { amount: 500, type: TransactionType.EXPENSE, category: "Travel", date: twoMonthsAgo, notes: "Weekend getaway trip", userId: admin.id },
        { amount: 120, type: TransactionType.EXPENSE, category: "Utilities", date: twoMonthsAgo, notes: "Power bill", userId: admin.id },

        // --- 3 MONTHS AGO ---
        { amount: 6000, type: TransactionType.INCOME, category: "Salary", date: threeMonthsAgo, notes: "Salary", userId: admin.id },
        { amount: 1500, type: TransactionType.EXPENSE, category: "Rent", date: threeMonthsAgo, notes: "Monthly rent", userId: admin.id },
        { amount: 350, type: TransactionType.EXPENSE, category: "Groceries", date: threeMonthsAgo, notes: "Groceries", userId: admin.id },
    ];

    await prisma.transaction.createMany({
        data: transactionData
    });
}

main()
    .then(async()=>{
        console.log("Seeding complete.")
        await prisma.$disconnect()
    })
    .catch(async(err)=>{
        console.log(err)
        await prisma.$disconnect()
    })