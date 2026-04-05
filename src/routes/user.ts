import { Router } from "express";
import { getAllUsers, login, logout, signUp, toggleUserStatus } from "../controllers/user/user.js";
import { authenticate } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { updateUserRole } from "../controllers/user/role.js";

const r = Router()

r.post("/signUp", signUp)
r.post("/login", login)
r.post("/logout", authenticate ,logout)
r.post("/updateRole/:id", authenticate, authorizeRoles(["ADMIN"]), updateUserRole)
r.patch("/:id/status", authenticate, authorizeRoles(["ADMIN"]), toggleUserStatus)

r.get("/",authenticate,authorizeRoles(["ADMIN"]), getAllUsers)
export default r