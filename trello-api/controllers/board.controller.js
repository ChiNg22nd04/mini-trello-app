const { db } = require("../firebase");
const { getIO } = require("../config/socket");
const { sendInviteEmail } = require("../services/email.service");

const boardsCollection = db.collection("boards");
const invitesCollection = db.collection("invites");

const getBoards = async (req, res) => {
    try {
        const userId = req.user.id;
        const snapshot = await boardsCollection.where("members", "array-contains", userId).get();

        const boards = snapshot.docs.map((doc) => {
            const board = doc.data();
            return {
                id: doc.id,
                name: board.name,
                description: board.description,
            };
        });

        console.log("boards", boards);
        res.status(200).json(boards);
    } catch (err) {
        console.error("err", err);
        res.status(500).json({ error: "Failed to get boards" });
    }
};

// GET /boards/:id
const getBoardById = async (req, res) => {
    try {
        const boardId = req.params.id;
        const boardDoc = await boardsCollection.doc(boardId).get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Board not found" });
        }

        const data = boardDoc.data();

        const board = {
            id: boardDoc.id,
            name: data.name,
            description: data.description,
        };

        res.status(200).json(board);
    } catch (err) {
        console.error("Error getting board", err);
        res.status(500).json({ error: "Failed to get board" });
    }
};

const createBoard = async (req, res) => {
    try {
        const { name, description, members = [] } = req.body;
        const userId = req.user.id;

        const uniqueMembers = Array.from(new Set([...members, userId]));
        const newBoard = {
            name,
            description,
            ownerId: userId,
            members: uniqueMembers,
            createdAt: new Date(),
        };
        const docRef = await boardsCollection.add(newBoard);

        const board = { id: docRef.id, name, description };
        getIO().emit("boardCreated", board);

        res.status(200).json(board);
    } catch (err) {
        console.error("err", err);
        res.status(500).json({ error: "Failed to create board" });
    }
};

const updateBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const { name, description } = req.body;

        const boardRef = boardsCollection.doc(boardId);
        const boardDoc = await boardRef.get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Board not found" });
        }

        const existingData = boardDoc.data();
        const updatedData = {
            name: name ?? existingData.name,
            description: description ?? existingData.description,
        };

        await boardRef.update(updatedData);

        getIO().emit("boardUpdated", updatedData);

        res.status(200).json(updatedData);
    } catch (err) {
        console.error("Error updating board", err);
        res.status(500).json({ error: "Failed to update board" });
    }
};

const deleteBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const boardRef = boardsCollection.doc(boardId);
        const boardDoc = await boardRef.get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Board not found" });
        }

        await boardRef.delete();
        getIO().emit("boardDeleted", { id: boardId });
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting board", err);
        res.status(500).json({ error: "Failed to delete board" });
    }
};

const inviteToBoard = async (req, res) => {
    try {
        const nameUser = req.user.username;
        console.log("nameUser", nameUser);
        const boardId = req.params.id;
        console.log("boardId", boardId);
        const { boardOwnerId, memberId, emailMember, status = "pending" } = req.body;

        const boardDoc = await boardsCollection.doc(boardId).get();
        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Board not found" });
        }
        const boardData = boardDoc.data();
        const boardName = boardData.name;

        const inviteRef = invitesCollection.doc();
        const inviteId = inviteRef.id;

        const newInvite = {
            inviteId,
            boardId,
            boardOwnerId,
            memberId,
            emailMember,
            status,
            type: "board",
            createdAt: new Date(),
        };

        console.log("newInvite", newInvite);
        await inviteRef.set(newInvite);

        const emailResult = await sendInviteEmail(emailMember, boardName, inviteId, boardId, nameUser);
        if (!emailResult.success) {
            console.error("Failed to send invite email:", emailResult.error);
        }

        getIO().emit("boardInviteSent", newInvite);

        res.status(201).json(newInvite);
    } catch (err) {
        console.error("Failed to invite to board:", err);
        res.status(500).json({ msg: "Error inviting to board" });
    }
};

module.exports = {
    getBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    inviteToBoard,
};
