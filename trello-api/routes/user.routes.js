const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const authMiddleware = require("../middleware/auth.middleware.js");

router.get("/:uId", authMiddleware, userController.getUserByUId);
router.put("/:uId", authMiddleware, userController.updateUserByUId);
router.delete("/:uId", authMiddleware, userController.deleteUserByUId); // tùy chọn

module.exports = router;
