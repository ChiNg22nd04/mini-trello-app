const { db } = require("../firebase");

const getCards = async (req, res) => {
    try {
        const snapshot = await db.collection("cards").where("owner", "==", req.user.id).get();
        const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(cards);
    } catch (err) {
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
        const docRef = await db.collection("cards").add(newCard);
        res.status(201).json({ id: docRef.id });
    } catch (err) {
        res.status(500).json({ msg: "Error creating card" });
    }
};
module.exports = { getCards, createCard };
