import { Router } from "express";
import { login, logout, signUp, toggleUserStatus } from "../controllers/user/user.js";
import { authenticate } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { updateUserRole } from "../controllers/user/role.js";

const r = Router()

r.post("/signUp", signUp)
r.post("/login", login)
r.post("/logout", authenticate ,logout)
r.post("/updateRole", authenticate, authorizeRoles(["ADMIN"]), updateUserRole)
r.patch("/users/:id/status", authenticate, authorizeRoles(["ADMIN"]), toggleUserStatus)
export default r