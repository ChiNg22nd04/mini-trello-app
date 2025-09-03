const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const getTasksByCard = async (req, res) => {
    const { cardId } = req.params;
    try {
        // tasks are stored under cards/{cardId}/tasks subcollection
        const taskRef = db.collection(`cards/${cardId}/tasks`);
        const snapshot = await taskRef.get();
        const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).json({ msg: "Error getting tasks" });
    }
};

// POST /cards/:cardId/tasks
const createTask = async (req, res) => {
    const { cardId } = req.params;
    const { title, status = "todo", description = "", completed = false } = req.body;

    try {
        const newTask = {
            title,
            status,
            description,
            completed,
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

// PUT /cards/:cardId/tasks/:taskId
const updateTask = async (req, res) => {
    const { cardId, taskId } = req.params;
    const updates = req.body || {};
    try {
        const taskDocRef = db.collection(`cards/${cardId}/tasks`).doc(taskId);
        await taskDocRef.update(updates);
        const updated = await taskDocRef.get();
        const updatedTask = { id: updated.id, ...updated.data() };

        getIO().to(cardId).emit("taskUpdated", { cardId, task: updatedTask });

        res.json(updatedTask);
    } catch (err) {
        console.error("Error updating task:", err.message);
        res.status(500).json({ msg: "Error updating task" });
    }
};

// DELETE /cards/:cardId/tasks/:taskId
const deleteTask = async (req, res) => {
    const { cardId, taskId } = req.params;
    try {
        const taskDocRef = db.collection(`cards/${cardId}/tasks`).doc(taskId);
        await taskDocRef.delete();

        getIO().to(cardId).emit("taskDeleted", { cardId, taskId });

        res.json({ id: taskId });
    } catch (err) {
        console.error("Error deleting task:", err.message);
        res.status(500).json({ msg: "Error deleting task" });
    }
};

module.exports = { getTasksByCard, createTask, updateTask, deleteTask };
