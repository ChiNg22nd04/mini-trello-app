const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const cardsCollection = db.collection("cards");
const tasksCollection = db.collection("tasks");
const usersCollection = db.collection("users");

const ALLOWED_STATUSES = ["todo", "doing", "done"];

const getCards = async (req, res) => {
    try {
        const boardId = req.params.boardId;

        const snapshot = await cardsCollection.where("boardId", "==", boardId).get();
        const cards = snapshot.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
                status: doc.data().status || "todo",
            };
        });

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
        const { name, description, createdAt, members, status } = req.body;

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(",")}` });
        }

        const newCard = {
            boardId,
            name,
            description,
            ownerId,
            createdAt: createdAt || new Date(),
            members: members || [],
            status: status || "todo",
        };

        const docRef = await cardsCollection.add(newCard);

        const createdCard = {
            id: docRef.id,
            name,
            description,
            ownerId,
            createdAt: newCard.createdAt,
            members: newCard.members,
            status: newCard.status,
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
            status: cardDoc.data().status || "todo",
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
                status: data.status || "todo",
            };
        });

        res.status(200).json(cards);
    } catch (err) {
        console.error("Failed to get cards by user:", err);
        res.status(500).json({ msg: "Error fetching cards by user" });
    }
};

const updateCard = async (req, res) => {
    try {
        const cardId = req.params.id;
        const ownerId = req.user.id;
        const boardId = req.params.boardId;

        const { name, description, status, ...rest } = req.body;

        const cardRef = cardsCollection.doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Card not found" });
        }
        const existingData = cardDoc.data();

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(",")}` });
        }

        const updatedData = {
            name: name ?? existingData.name,
            description: description ?? existingData.description,
            status: status ?? existingData.status ?? "todo",
            ...rest,
        };

        await cardRef.update(updatedData);

        const payload = { id: cardId, ...updatedData };
        getIO().emit("cardUpdated", payload);
        res.status(200).json(payload);
    } catch (err) {
        console.error("Failed to update card:", err);
        res.status(500).json({ msg: "Error updating card" });
    }
};

const deleteCard = async (req, res) => {
    try {
        const cardId = req.params.id;
        await cardsCollection.doc(cardId).delete();
        getIO().emit("cardDeleted", cardId);
        res.status(204).send();
    } catch (err) {
        console.error("Failed to delete card:", err);
        res.status(500).json({ msg: "Error deleting card" });
    }
};

const getMembersOfCard = async (req, res) => {
    try {
        const cardId = req.params.id;
        console.log("cardId", cardId);
        // 1. Lấy tất cả task thuộc cardId
        const taskSnapshot = await tasksCollection.where("cardId", "==", cardId).get();
        console.log("taskSnapshot", taskSnapshot);
        if (taskSnapshot.empty) {
            return res.status(200).json([]);
        }

        // 2. Lấy tất cả userId được assign trong các task
        const memberIdsSet = new Set();
        taskSnapshot.forEach((doc) => {
            const task = doc.data();
            console.log("task", task);
            if (task.assignedTo) {
                if (Array.isArray(task.assignedTo)) {
                    task.assignedTo.forEach((uid) => memberIdsSet.add(uid));
                } else {
                    memberIdsSet.add(task.assignedTo);
                }
            }
        });
        console.log("memberIdsSet", memberIdsSet);
        if (memberIdsSet.size === 0) {
            return res.status(200).json([]);
        }

        // 3. Lấy thông tin user từ usersCollection
        const members = [];
        for (const uid of memberIdsSet) {
            const userDoc = await usersCollection.doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                members.push({
                    id: userDoc.id,
                    username: userData.username,
                    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${(userData.username || "U")[0]}&background=random`,
                });
            }
        }

        console.log("Members for card via tasks:", members);
        res.status(200).json(members);
    } catch (err) {
        console.error("Failed to get members of card:", err);
        res.status(500).json({ msg: "Error fetching card members" });
    }
};

module.exports = {
    getCards,
    createCard,
    getCardById,
    getCardByUser,
    updateCard,
    deleteCard,
    getMembersOfCard,
};
