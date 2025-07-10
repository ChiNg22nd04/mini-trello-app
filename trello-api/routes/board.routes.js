const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");
const { boardController } = require("../controllers");

router.get("/", authMiddleware, boardController.getBoards);
router.post("/", authMiddleware, boardController.createBoard);

module.exports = router;
