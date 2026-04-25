import { Router } from "express";
import {
  getUnreadSummary,
  savePushSubscription,
} from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.get("/unread", getUnreadSummary);
router.post("/subscribe", savePushSubscription);

export default router;
