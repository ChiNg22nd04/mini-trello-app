const { db } = require("../firebase");
const { getIO, emitToCard, emitToBoard } = require("../config/socket");

const tasksCollection = db.collection("tasks");
const boardsCollection = db.collection("boards");

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
        // Disallow creating task if board is closed
        try {
            const boardDoc = await boardsCollection.doc(boardId).get();
            if (!boardDoc.exists) return res.status(404).json({ msg: "Board not found" });
            const bdata = boardDoc.data();
            if (bdata?.closed) return res.status(403).json({ msg: "Board is closed" });
        } catch (e) {
            console.error("Board check failed when creating task", e);
            return res.status(500).json({ msg: "Error creating task" });
        }

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

        // Resolve assigned users info for richer payloads/toasts
        let assignedUsers = [];
        if (createdTask.assignedTo && createdTask.assignedTo.length) {
            try {
                for (const uid of createdTask.assignedTo) {
                    const u = await db.collection("users").doc(uid).get();
                    if (u.exists) {
                        const ud = u.data();
                        assignedUsers.push({ id: u.id, username: ud.username, avatar: ud.avatar || null });
                    }
                }
            } catch (_) {}
        }

        // Legacy room emit (string room previously mismatched)
        getIO().to(cardId).emit("taskCreated", { cardId, boardId, task: createdTask, actorId: req.user?.id, actorName: req.user?.username, assignedUsers });
        // Consistent scoped emits
        const createdPayload = { boardId, cardId, task: createdTask, actorId: req.user?.id, actorName: req.user?.username, assignedUsers };
        emitToCard(boardId, cardId, "tasks:created", createdPayload);
        // Also broadcast to the board room for broader listeners
        emitToBoard(boardId, "tasks:created", createdPayload);
        emitToBoard(boardId, "activity", {
            scope: "task",
            action: "created",
            boardId,
            cardId,
            taskId: createdTask.id,
            actorId: req.user?.id,
            actorName: req.user?.username,
            message: `${req.user?.username || "Someone"} added task "${title}"`,
        });

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

        // Resolve assigned users info for richer payloads/toasts
        let assignedUsers = [];
        if (updatedTask.assignedTo && updatedTask.assignedTo.length) {
            try {
                for (const uid of updatedTask.assignedTo) {
                    const u = await db.collection("users").doc(uid).get();
                    if (u.exists) {
                        const ud = u.data();
                        assignedUsers.push({ id: u.id, username: ud.username, avatar: ud.avatar || null });
                    }
                }
            } catch (_) {}
        }

        // Legacy room emit
        getIO().to(cardId).emit("taskUpdated", { cardId, boardId, task: updatedTask, actorId: req.user?.id, actorName: req.user?.username, assignedUsers });
        // Consistent scoped emits
        const updatedPayload = { boardId, cardId, task: updatedTask, actorId: req.user?.id, actorName: req.user?.username, assignedUsers };
        emitToCard(boardId, cardId, "tasks:updated", updatedPayload);
        // Also broadcast to the board room
        emitToBoard(boardId, "tasks:updated", updatedPayload);
        emitToBoard(boardId, "activity", {
            scope: "task",
            action: "updated",
            boardId,
            cardId,
            taskId,
            actorId: req.user?.id,
            actorName: req.user?.username,
            message: `${req.user?.username || "Someone"} updated task${
                updates?.title
                    ? ` name to "${updates.title}"`
                    : updates?.completed !== undefined
                    ? ` completion to ${!!updates.completed}`
                    : updates?.status
                    ? ` status to ${updates.status}`
                    : updates?.description
                    ? " description"
                    : ""
            }${updates?.addMember ? ` (added member)` : updates?.removeMember ? ` (removed member)` : ""}`,
        });

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
        const snapshot = await taskDocRef.get();
        const existed = snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
        await taskDocRef.delete();

        // Resolve assigned users of deleted task
        let assignedUsers = [];
        if (existed?.assignedTo && existed.assignedTo.length) {
            try {
                for (const uid of existed.assignedTo) {
                    const u = await db.collection("users").doc(uid).get();
                    if (u.exists) {
                        const ud = u.data();
                        assignedUsers.push({ id: u.id, username: ud.username, avatar: ud.avatar || null });
                    }
                }
            } catch (_) {}
        }

        // Legacy room emit
        getIO().to(cardId).emit("taskDeleted", { cardId, taskId, actorId: req.user?.id, actorName: req.user?.username, assignedUsers });
        // Consistent scoped emits
        const deletedPayload = { boardId: req.params.boardId, cardId, taskId, actorId: req.user?.id, actorName: req.user?.username, assignedUsers };
        emitToCard(req.params.boardId, cardId, "tasks:deleted", deletedPayload);
        // Also broadcast to the board room
        emitToBoard(req.params.boardId, "tasks:deleted", deletedPayload);
        emitToBoard(req.params.boardId, "activity", {
            scope: "task",
            action: "deleted",
            boardId: req.params.boardId,
            cardId,
            taskId,
            actorId: req.user?.id,
            actorName: req.user?.username,
            message: `${req.user?.username || "Someone"} deleted a task`,
        });

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
