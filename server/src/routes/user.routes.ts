import { Router } from "express";
import { getUserById, searchUsers } from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/search", searchUsers);
router.get("/:id", getUserById);

export default router;
