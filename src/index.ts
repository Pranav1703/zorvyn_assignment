import express from 'express'
import { getEnvVar } from './utils/env.js'
import { globalErrorHandler } from './middleware/errorHandler.js'
import cookieParser from 'cookie-parser'
import transactionRouter from './routes/transaction.js'
import dashboardRouter from './routes/dashboard.js'
import userRouter from './routes/user.js'

const port = getEnvVar("PORT")

const app = express()
app.use(cookieParser())
app.use(express.json())

app.use("/transaction", transactionRouter)
app.use("/dashboard", dashboardRouter)
app.use("/user", userRouter)

app.use(globalErrorHandler)

app.listen(port,()=>{
    console.log(`Listening on port:${port}`)
})