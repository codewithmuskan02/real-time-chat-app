import { Router } from "express";
import { getUploadSignature } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.post("/", getUploadSignature);

export default router;
