const express = require("express");
const router = express.Router();
const { cardController } = require("../controllers");

const authMiddleware = require("../middleware/auth.middleware.js");

router.get("/", authMiddleware, cardController.getCards);
router.post("/", authMiddleware, cardController.createCard);

module.exports = router;
