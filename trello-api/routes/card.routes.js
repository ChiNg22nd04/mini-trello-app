const express = require("express");
const router = express.Router({ mergeParams: true });
const { cardController } = require("../controllers");

const authMiddleware = require("../middleware/auth.middleware.js");

router.get("/", authMiddleware, cardController.getCards);
router.post("/", authMiddleware, cardController.createCard);
router.get("/:id", authMiddleware, cardController.getCardById);
router.get("/user/:userId", authMiddleware, cardController.getCardByUser);

module.exports = router;
