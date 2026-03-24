import express from "express";
import auth from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";
import * as controller from "../controllers/adminController.js";

const router = express.Router();

router.put("/approve-company", auth, role("admin"), controller.approveCompany);
router.put("/approve-job", auth, role("admin"), controller.approveJob);

export default router;