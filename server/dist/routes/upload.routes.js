"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post("/", upload_controller_1.getUploadSignature);
exports.default = router;
