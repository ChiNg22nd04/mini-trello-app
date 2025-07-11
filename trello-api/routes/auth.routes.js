const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");

// GitHub OAuth routes
router.get("/github", authController.githubLogin);
router.get("/github/callback", authController.githubCallback);

// Email Magic Link routes
router.post("/email/send", authController.sendMagicCode);
router.get("/email/verify", authController.verifyMagicCode);

module.exports = router;
