const { db } = require("../firebase");

const getTasksByCard = async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const tasksSnapshot = await db.collection(`cards/${cardId}/tasks`).get();
        const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ msg: "Error getting tasks" });
    }
};

const createTask = async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const { title, status } = req.body;
        const newTask = {
            title,
            status: status || "icebox",
            createdAt: Date.now(),
        };
        const taskRef = await db.collection(`cards/${cardId}/tasks`).add(newTask);
        res.status(201).json({ id: taskRef.id });
    } catch (err) {
        res.status(500).json({ msg: "Error creating task" });
    }
};

module.exports = { getTasksByCard, createTask };
