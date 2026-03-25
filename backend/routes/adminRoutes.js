import express from "express";
import auth from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";
import * as controller from "../controllers/adminController.js";

const router = express.Router();

router.post("/job", auth, role("admin"), controller.createJob);
router.get("/applicants/:jobId", auth, role("admin"), controller.getApplicants);
router.put("/status", auth, role("admin"), controller.updateStatus);
router.post("/company", auth, role("admin"), controller.createCompany);

router.post("/schedule-interview", auth, role("admin"), controller.scheduleInterview);

export default router;