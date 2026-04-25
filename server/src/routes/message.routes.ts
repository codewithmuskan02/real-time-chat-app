import { Router } from "express";
import { getRoomMessages, markRoomRead } from "../controllers/message.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/:roomId", getRoomMessages);
router.post("/:roomId/read", markRoomRead);

export default router;
