const { db } = require("../firebase");

const getCards = async (req, res) => {
    try {
        const userId = req.user.id;

        const cardsCollection = db.collection("cards");
        const query = cardsCollection.where("owner", "==", userId);

        const snapshot = await query.get();
        const cards = [];

        snapshot.forEach((doc) => {
            const cardData = doc.data();
            const card = {
                id: doc.id,
                title: cardData.title,
                owner: cardData.owner,
                createdAt: cardData.createdAt,
            };
            cards.push(card);
        });

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
            owner: req.user.id,
            createdAt: Date.now(),
        };
        const cardsCollection = db.collection("cards");
        const docRef = await cardsCollection.add(newCard);

        res.status(201).json({
            id: docRef.id,
            title: newCard.title,
            owner: newCard.owner,
            createdAt: newCard.createdAt,
        });
    } catch (err) {
        console.error("Failed to create card:", error.message);
        res.status(500).json({ msg: "Error creating card" });
    }
};
module.exports = { getCards, createCard };
