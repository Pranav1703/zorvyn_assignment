import { Router } from "express";
import { authenticate } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";

const r = Router()

r.get("/")

export default r