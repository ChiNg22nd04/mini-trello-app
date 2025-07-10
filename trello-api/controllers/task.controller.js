const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const getTasksByCard = async (req, res) => {
    const { cardId } = req.params;
    console.log("cardId", cardId);

    try {
        const taskRef = db.collection(`cards/${cardId}/tasks`);
        const snapshot = await taskRef.get();
        const task = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(task);
    } catch (err) {
        console.error("Error fetching task:", err.message);
        res.status(500).json({ msg: "Error getting task" });
    }
};

// POST /cards/:cardId/tasks
const createTask = async (req, res) => {
    const { cardId } = req.params;
    console.log("cardId", cardId);
    const { title, status = "icebox" } = req.body;

    try {
        const newTask = {
            title,
            status,
            createdAt: Date.now(),
        };

        const taskRef = await db.collection(`cards/${cardId}/tasks`).add(newTask);
        const createdTask = { id: taskRef.id, ...newTask };

        getIO().to(cardId).emit("taskCreated", { cardId, task: createdTask });

        res.status(201).json(createdTask);
    } catch (err) {
        console.error("Error creating task:", err.message);
        res.status(500).json({ msg: "Error creating task" });
    }
};

module.exports = { getTasksByCard, createTask };
