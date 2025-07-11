const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const cardsCollection = db.collection("cards");

const getCards = async (req, res) => {
    try {
        const boardId = req.params.boardId;
        console.log("boardId", boardId);

        const snapshot = await cardsCollection.where("boardId", "==", boardId).get();
        console.log("snapshot", snapshot.docs);
        const cards = snapshot.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });

        console.log("cards", cards);

        res.status(200).json(cards);
    } catch (err) {
        console.error("Failed to get cards:", err);
        res.status(500).json({ msg: "Error fetching cards" });
    }
};

const createCard = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const boardId = req.params.boardId;
        const { name, description, createdAt } = req.body;

        const newCard = {
            boardId,
            name,
            description,
            ownerId,
            createdAt: createdAt || new Date(),
        };

        const docRef = await cardsCollection.add(newCard);

        const createdCard = {
            id: docRef.id,
            name,
            description,
        };

        getIO().emit("cardCreated", createdCard);
        console.log("Card created successfully");

        res.status(201).json(createdCard);
    } catch (err) {
        console.error("Failed to create card:", err);
        res.status(500).json({ msg: "Error creating card" });
    }
};

const getCardById = async (req, res) => {
    try {
        const cardId = req.params.id;
        const cardDoc = await cardsCollection.doc(cardId).get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Card not found" });
        }

        const card = {
            id: cardDoc.id,
            name: cardDoc.data().name,
            description: cardDoc.data().description,
        };

        res.status(200).json(card);
    } catch (err) {
        console.error("Failed to get card:", err);
        res.status(500).json({ msg: "Error fetching card details" });
    }
};

const getCardByUser = async (req, res) => {
    try {
        console.log("req.params", req.params);
        const { boardId, userId } = req.params;

        const queryBoard = await cardsCollection.where("boardId", "==", boardId);
        const queryUser = await queryBoard.where("members", "array-contains", userId);
        const snapshot = await queryUser.get();

        const cards = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                description: data.description,
                tasks_count: data.tasksCount || 0,
                list_member: data.members || [],
                createdAt: data.createdAt || null,
            };
        });

        res.status(200).json(cards);
    } catch (err) {
        console.error("Failed to get cards by user:", err);
        res.status(500).json({ msg: "Error fetching cards by user" });
    }
};

module.exports = { getCards, createCard, getCardById, getCardByUser };
