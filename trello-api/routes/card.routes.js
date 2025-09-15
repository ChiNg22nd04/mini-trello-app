const express = require("express");
const router = express.Router({ mergeParams: true });
const { cardController } = require("../controllers");
const activityController = require("../controllers/activity.controller");

const authMiddleware = require("../middleware/auth.middleware.js");

router.get("/", authMiddleware, cardController.getCards);
router.post("/", authMiddleware, cardController.createCard);
router.get("/:id", authMiddleware, cardController.getCardById);
router.get("/user/:userId", authMiddleware, cardController.getCardByUser);
router.put("/:id", authMiddleware, cardController.updateCard);
router.delete("/:id", authMiddleware, cardController.deleteCard);
router.get("/:id/members", authMiddleware, cardController.getMembersOfCard);
router.get("/status/:status", authMiddleware, cardController.getCardByStatus);
// Activities under a card
router.get("/:cardId/activities", authMiddleware, activityController.getCardActivities);
module.exports = router;
