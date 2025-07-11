const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const boardsCollection = db.collection("boards");

// POST /boards
const getBoards = async (req, res) => {
    try {
        const userId = req.user.id;
        const snapshot = await boardsCollection.where("members", "array-contains", userId).get();

        const boards = snapshot.docs.map((doc) => {
            const board = doc.data();
            return {
                id: doc.id,
                ...board,
            };
        });

        console.log("boards", boards);
        res.status(200).json(boards);
    } catch (err) {
        console.error("err", err);
        res.status(500).json({ error: "Failed to get boards" });
    }
};

// GET /boards/all
const getAllBoards = async (req, res) => {
    try {
        const { id } = req.user;
        console.log("id", id);
        console.log("boardsCollection", boardsCollection);
        const data = await boardsCollection.where("ownerId", "==", id).get();
        console.log("data", data.docs);

        const boards = data.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
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
            ...data,
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

        const board = { id: docRef.id, ...newBoard };
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

        await boardRef.update({ name, description });
        res.status(200).json({ id: boardId, name, description });
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

module.exports = {
    getBoards,
    createBoard,
    getAllBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
};
