const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const boardsCollection = db.collection("boards");

const getBoards = async (req, res) => {
    try {
        const { id } = req.user;
        const data = await boardsCollection.where("userId", "array-contains", id).get();

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

const createBoard = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.uid;
        const newBoard = {
            name,
            description,
            ownerId: userId,
            members: [userId],
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

module.exports = {
    getBoards,
    createBoard,
};
