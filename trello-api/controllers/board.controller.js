const { db, admin } = require("../firebase");
const { getIO } = require("../config/socket");
const { sendInviteEmail } = require("../services/email.service");

const boardsCollection = db.collection("boards");
const invitesCollection = db.collection("invites");
const usersCollection = db.collection("users");

const getBoards = async (req, res) => {
    try {
        const userId = req.user.id;
        const snapshot = await boardsCollection.where("members", "array-contains", userId).orderBy("order", "asc").get();

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
            members: data.members,
            ownerId: data.ownerId,
            createdAt: data.createdAt,
            order: data.order,
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

        const snapshot = await boardsCollection.where("ownerId", "==", userId).orderBy("order", "desc").limit(1).get();

        const maxOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order ?? 0) + 1;

        const uniqueMembers = Array.from(new Set([...members, userId]));
        const newBoard = {
            name,
            description,
            ownerId: userId,
            members: uniqueMembers,
            createdAt: new Date(),
            order: maxOrder,
        };
        const docRef = await boardsCollection.add(newBoard);

        const board = { id: docRef.id, name, description, order: maxOrder };
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
        const { name, description, order } = req.body;

        const boardRef = boardsCollection.doc(boardId);
        const boardDoc = await boardRef.get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Board not found" });
        }

        const existingData = boardDoc.data();
        const updatedData = {
            name: name ?? existingData.name,
            description: description ?? existingData.description,
            order: order ?? existingData.order,
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
        const boardOwnerId = req.user.id;
        const boardId = req.params.id;

        const { emailMember, status = "pending" } = req.body;

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
            memberId: null,
            emailMember,
            status,
            type: "board",
            createdAt: new Date(),
        };

        await inviteRef.set(newInvite);

        const emailResult = await sendInviteEmail(emailMember, boardName, inviteId, boardId, nameUser);
        getIO().emit("boardInviteSent", newInvite);

        if (!emailResult.success) {
            console.error("Failed to send invite email:", emailResult.error);
        }

        res.status(201).json(newInvite);
    } catch (err) {
        console.error("Error inviting to board:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
};

const acceptBoardInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        console.log("inviteId", inviteId);
        const memberId = req.user.id;

        const inviteSnapshot = await invitesCollection.doc(inviteId).get();
        if (!inviteSnapshot.exists) {
            return res.status(404).json({ error: "Invite not found" });
        }

        const inviteData = inviteSnapshot.data();

        if (inviteData.status !== "pending") {
            return res.status(400).json({ error: "Invite has already been responded to" });
        }

        await invitesCollection.doc(inviteId).update({
            status: "accepted",
            memberId,
        });

        const boardRef = boardsCollection.doc(inviteData.boardId);
        await boardRef.update({
            members: admin.firestore.FieldValue.arrayUnion(memberId),
        });
        const acceptedInfo = {
            inviteId,
            boardId: inviteData.boardId,
            memberId,
            emailMember: inviteData.emailMember,
            status: "accepted",
        };

        getIO().emit("boardInviteAccepted", acceptedInfo);

        console.log("Board invite accepted:", acceptedInfo);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error accepting board invite:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const getMembersOfBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user.id;

        console.log("userId", userId);
        console.log("boardId", boardId);

        const boardDoc = await boardsCollection.doc(boardId).get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Board not found" });
        }

        const boardData = boardDoc.data();
        if (!boardData.members.includes(userId)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const memberIds = boardData.members || [];
        const allMembers = [];

        for (const memberId of memberIds) {
            const userDoc = await usersCollection.doc(memberId).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                allMembers.push({
                    id: memberId,
                    username: userData.username || "Unknown",
                });
            } else {
                allMembers.push({
                    id: memberId,
                    username: "Unknown",
                });
            }
        }
        console.log("allMembers", allMembers);

        res.status(200).json({ members: allMembers });
    } catch (err) {
        console.error("getMembersOfBoard error:", err);
        res.status(500).json({ error: "Failed to get board members" });
    }
};

module.exports = {
    getBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    inviteToBoard,
    acceptBoardInvite,
    getMembersOfBoard
};
