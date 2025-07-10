const express = require("express");
const router = express.Router({ mergeParams: true });
const { taskController } = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, taskController.getTasksByCard);
router.post("/", authMiddleware, taskController.createTask);

module.exports = router;
