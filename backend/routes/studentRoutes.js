import express from "express";
import auth from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";
import * as controller from "../controllers/studentController.js";

const router = express.Router();

router.get("/jobs", auth, controller.getJobs);
router.post("/apply", auth, role("student"), controller.applyJob);
router.get("/my", auth, role("student"), controller.myApplications);

router.put("/update", auth, role("student"), controller.updateUser);

router.get("/get-profile", auth, role("student"), controller.getProfile);

router.get('/get-interviews', auth, role("student"), controller.getMyInterviews);

export default router;