const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const tasksCollection = db.collection("tasks");

// GET /boards/:boardId/cards/:cardId/tasks
const getTasksByCard = async (req, res) => {
    const { cardId } = req.params;
    try {
        const snapshot = await tasksCollection.where("cardId", "==", cardId).get();
        const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).json({ msg: "Error getting tasks" });
    }
};

// POST /boards/:boardId/cards/:cardId/tasks
const createTask = async (req, res) => {
    const { boardId, cardId } = req.params;
    const { title, status = "todo", description = "", completed = false, assignedTo = [] } = req.body;

    try {
        const newTask = {
            boardId,
            cardId,
            title,
            status,
            description,
            completed,
            assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
            createdAt: Date.now(),
        };

        const docRef = await tasksCollection.add(newTask);
        const createdTask = { id: docRef.id, ...newTask };

        getIO().to(cardId).emit("taskCreated", { cardId, boardId, task: createdTask });

        res.status(201).json(createdTask);
    } catch (err) {
        console.error("Error creating task:", err.message);
        res.status(500).json({ msg: "Error creating task" });
    }
};

// PUT /boards/:boardId/cards/:cardId/tasks/:taskId
const updateTask = async (req, res) => {
    const { cardId, boardId, taskId } = req.params;
    const updates = req.body || {};

    try {
        const taskDocRef = tasksCollection.doc(taskId);
        const taskSnapshot = await taskDocRef.get();

        if (!taskSnapshot.exists) {
            return res.status(404).json({ msg: "Task not found" });
        }

        const currentData = taskSnapshot.data();

        // xử lý assignedTo
        let newAssigned = currentData.assignedTo || [];
        if (updates.addMember) {
            if (!newAssigned.includes(updates.addMember)) newAssigned.push(updates.addMember);
        }
        if (updates.removeMember) {
            newAssigned = newAssigned.filter((id) => id !== updates.removeMember);
        }
        if (updates.assignedTo) {
            newAssigned = Array.isArray(updates.assignedTo) ? updates.assignedTo : newAssigned;
        }

        const finalUpdates = {
            ...updates,
            assignedTo: newAssigned,
            updatedAt: Date.now(),
        };
        delete finalUpdates.addMember;
        delete finalUpdates.removeMember;

        await taskDocRef.update(finalUpdates);
        const updated = await taskDocRef.get();
        const updatedTask = { id: updated.id, ...updated.data() };

        getIO().to(cardId).emit("taskUpdated", { cardId, boardId, task: updatedTask });

        res.json(updatedTask);
    } catch (err) {
        console.error("Error updating task:", err.message);
        res.status(500).json({ msg: "Error updating task" });
    }
};

// DELETE /boards/:boardId/cards/:cardId/tasks/:taskId
const deleteTask = async (req, res) => {
    const { cardId, taskId } = req.params;
    try {
        const taskDocRef = tasksCollection.doc(taskId);
        await taskDocRef.delete();

        getIO().to(cardId).emit("taskDeleted", { cardId, taskId });

        res.json({ id: taskId });
    } catch (err) {
        console.error("Error deleting task:", err.message);
        res.status(500).json({ msg: "Error deleting task" });
    }
};

// GET members of a task
const getMembersOfTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const taskDocRef = tasksCollection.doc(taskId);
        const taskSnapshot = await taskDocRef.get();

        if (!taskSnapshot.exists) {
            return res.status(404).json({ msg: "Task not found" });
        }

        const taskData = taskSnapshot.data();
        const memberIds = taskData.assignedTo || [];

        if (memberIds.length === 0) return res.status(200).json([]);

        const members = [];
        for (const uid of memberIds) {
            const userDoc = await db.collection("users").doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                members.push({
                    id: userDoc.id,
                    username: userData.username,
                    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${(userData.username || "U")[0]}&background=random`,
                });
            }
        }

        res.status(200).json(members);
    } catch (err) {
        console.error("Error fetching task members:", err.message);
        res.status(500).json({ msg: "Error getting task members" });
    }
};

module.exports = { getTasksByCard, createTask, updateTask, deleteTask, getMembersOfTask };
