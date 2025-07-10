const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const getCards = async (req, res) => {
    try {
        // const {id} = req.user
        const userId = req.user.id;
        console.log("userId", userId);

        const cardsCollection = db.collection("cards");
        const query = cardsCollection.where("ownerId", "==", userId);

        const snapshot = await query.get();
        const cards = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json(cards);
    } catch (err) {
        console.error("Failed to get cards:", err.message);
        res.status(500).json({ msg: "Error fetching cards" });
    }
};

const createCard = async (req, res) => {
    try {
        const { title } = req.body;
        const newCard = {
            title,
            ownerId: req.user.userId,
            createdAt: Date.now(),
        };
        const cardsCollection = db.collection("cards");
        const docRef = await cardsCollection.add(newCard);

        const createdCard = {
            id: docRef.id,
            ...newCard,
        };

        getIO().emit("cardCreated", createdCard);
        console.log("Card created successfully");

        res.status(201).json(createdCard);
    } catch (err) {
        console.error("Failed to create card:", err.message);
        res.status(500).json({ msg: "Error creating card" });
    }
};
module.exports = { getCards, createCard };
