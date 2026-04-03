import { Router } from "express";
import { authenticate } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from "../contollers/transactions/transaction.js";

const r = Router()

r.get("/",authenticate, authorizeRoles("ANALYST", "ADMIN","VIEWER"), getAllTransactions);
r.post("/new", authenticate, authorizeRoles("ADMIN"), createTransaction)
r.put("/:id", authorizeRoles("ADMIN"), updateTransaction);
r.delete("/:id", authorizeRoles("ADMIN"), deleteTransaction);

export default r