const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");

// GitHub OAuth routes
router.get("/github", authController.githubLogin);
router.get("/auth/github/callback", authController.githubCallback);

// Google OAuth routes
router.get("/google", authController.googleLogin);
router.get("/auth/google/callback", authController.googleCallback);

// Email Magic Link routes
router.post("/signin", authController.sendMagicCode);
router.get("/auth/verify", authController.verifyMagicCode);

module.exports = router;
