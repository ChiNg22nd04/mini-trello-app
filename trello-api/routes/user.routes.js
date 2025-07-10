const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware.js");

router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser); // tùy chọn

module.exports = router;
