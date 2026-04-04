import { Router } from "express";
import { authenticate } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from "../controllers/transactions/transaction.js";

const r = Router()

r.get("/",authenticate, authorizeRoles(["ANALYST", "ADMIN"]), getAllTransactions);
r.post("/new", authenticate, authorizeRoles(["ADMIN"]), createTransaction)
r.patch("/:id", authenticate, authorizeRoles(["ADMIN"]), updateTransaction);
r.delete("/:id", authenticate, authorizeRoles(["ADMIN"]), deleteTransaction);

export default r