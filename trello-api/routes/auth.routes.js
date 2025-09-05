const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");

// GitHub OAuth routes
router.get("/github", authController.githubLogin);
router.get("/auth/github/callback", authController.githubCallback);

// Email Magic Link routes
router.post("/signin", authController.sendMagicCode);
router.get("/auth/verify", authController.verifyMagicCode);

module.exports = router;
