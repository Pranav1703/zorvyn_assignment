//this is a standalone script to seed databse with admin user.

import bcrypt from "bcryptjs"
import { prisma } from "./prismaClient.js"

async function main() {
    const adminUsername = "AdminUser"
    const adminEmail = "admin@zorvyn.in"
    const hashedPass = await bcrypt.hash("admin123",10)

    console.log("seeding admin user into db...")

    await prisma.user.upsert({
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