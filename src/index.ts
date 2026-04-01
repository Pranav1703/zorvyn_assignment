import express from 'express'
import { getEnvVar } from './utils/env.js'

const app = express()

const port = getEnvVar("PORT")

app.listen(port,()=>{
    console.log(`Listening on port:${port}`)
})