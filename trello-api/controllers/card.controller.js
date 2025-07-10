const { db } = require("../firebase");

const getCards = async (req, res) => {
    try {
        const githubId = req.user.githubId;
        console.log("githubId", githubId);

        const cardsCollection = db.collection("cards");
        const query = cardsCollection.where("ownerId", "==", githubId);

        const snapshot = await query.get();
        const cards = [];

        snapshot.forEach((doc) => {
            const cardData = doc.data();
            const card = {
                id: doc.id,
                title: cardData.title,
                ownerId: cardData.ownerId,
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
            ownerId: req.user.githubId,
            createdAt: Date.now(),
        };
        const cardsCollection = db.collection("cards");
        const docRef = await cardsCollection.add(newCard);

        res.status(201).json({
            id: docRef.id,
            title: newCard.title,
            ownerId: newCard.ownerId,
            createdAt: newCard.createdAt,
        });
    } catch (err) {
        console.error("Failed to create card:", err.message);
        res.status(500).json({ msg: "Error creating card" });
    }
};
module.exports = { getCards, createCard };
