import { Router } from "express";
import { authenticate } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";
import { getCategoryTotals, getFinanceOverviewSummary, getMonthlyTrendsSummary, getRecentActivitySummary } from "../controllers/dashboard/dashboard.js";

const r = Router()

r.get("/financeOverview", authenticate, authorizeRoles("VIEWER", "ANALYST", "ADMIN"),getFinanceOverviewSummary)
r.get("/categoryTotals", authenticate, authorizeRoles("VIEWER", "ANALYST", "ADMIN"), getCategoryTotals)
r.get("/recentActivity", authenticate, authorizeRoles("VIEWER", "ANALYST", "ADMIN"), getRecentActivitySummary)
r.get("/monthlyTrends", authenticate, authorizeRoles("VIEWER", "ANALYST", "ADMIN"), getMonthlyTrendsSummary)

export default r