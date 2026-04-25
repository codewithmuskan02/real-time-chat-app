import { Router } from "express";
import {
  createOrGetDM,
  createRoom,
  getMyRooms,
  inviteToRoom,
  removeMember,
} from "../controllers/room.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.post("/", createRoom);
router.get("/", getMyRooms);
router.post("/dm/:userId", createOrGetDM);
router.post("/:id/invite", inviteToRoom);
router.delete("/:id/members/:userId", removeMember);

export default router;
