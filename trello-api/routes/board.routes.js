const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");
const { boardController } = require("../controllers");

router.use(authMiddleware);

router.post("/", boardController.createBoard);
router.get("/", boardController.getBoards);
router.get("/all", boardController.getAllBoards);
router.get("/:id", boardController.getBoardById);
router.put("/:id", boardController.updateBoard);
router.delete("/:id", boardController.deleteBoard);

module.exports = router;
