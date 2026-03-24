import express from "express";
import auth from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";
import * as controller from "../controllers/studentController.js";

const router = express.Router();

router.get("/jobs", auth, role("student"), controller.getJobs);
router.post("/apply", auth, role("student"), controller.applyJob);
router.get("/my", auth, role("student"), controller.myApplications);

export default router;