const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");
const { boardController } = require("../controllers");

router.use(authMiddleware);

router.post("/", boardController.createBoard);
router.get("/", boardController.getBoards);
router.get("/:id", boardController.getBoardById);
router.put("/:id", boardController.updateBoard);
router.delete("/:id", boardController.deleteBoard);
router.post("/:id/invite", boardController.inviteToBoard);
router.post("/:id/invite/:inviteId/accept", boardController.acceptBoardInvite);
router.get("/:id/members", boardController.getMembersOfBoard);
router.post("/:id/leave", boardController.leaveBoard);

module.exports = router;
