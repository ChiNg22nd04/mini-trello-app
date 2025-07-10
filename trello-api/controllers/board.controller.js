const { db } = require("../firebase");
const { getIO } = require("../config/socket");

const boardsCollection = db.collection("boards");

const getBoards = async (req, res) => {
    const { id } = req.user;
    const boards = await boardsCollection.where("userId", "==", id).get();
    res.json(boards.docs.map((doc) => doc.data()));
};
