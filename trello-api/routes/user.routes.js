const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const authMiddleware = require("../middleware/auth.middleware.js");

router.get("/:githubId", authMiddleware, userController.getUserByGithubId);
router.put("/:githubId", authMiddleware, userController.updateUserByGithubId);
router.delete("/:githubId", authMiddleware, userController.deleteUserByGithubId); // tùy chọn

module.exports = router;
