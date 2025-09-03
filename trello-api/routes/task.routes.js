const express = require("express");
const router = express.Router({ mergeParams: true });
const { taskController } = require("../controllers");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, taskController.getTasksByCard);
router.post("/", authMiddleware, taskController.createTask);
router.put("/:taskId", authMiddleware, taskController.updateTask);
router.delete("/:taskId", authMiddleware, taskController.deleteTask);

module.exports = router;
