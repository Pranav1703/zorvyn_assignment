import { Router } from "express";
import { login, logout, signUp } from "../contollers/user/user.js";
import { authenticate } from "../middleware/verify.js";

const r = Router()

r.post("/signUp", signUp)
r.post("/login", login)
r.post("/logout", authenticate ,logout)

export default r