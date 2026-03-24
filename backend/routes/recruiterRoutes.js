import express from "express";
import auth from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";
import * as controller from "../controllers/recruiterController.js";

const router = express.Router();

router.post("/job", auth, role("recruiter"), controller.createJob);
router.get("/applicants/:jobId", auth, role("recruiter"), controller.getApplicants);
router.put("/status", auth, role("recruiter"), controller.updateStatus);

export default router;