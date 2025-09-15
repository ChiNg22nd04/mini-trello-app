const { db, admin } = require("../firebase");
const { emitToBoard, emitToUser } = require("../config/socket");
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
                ownerId: board.ownerId,
                members: board.members || [],
                order: board.order ?? 0,
                createdAt: board.createdAt || null,
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
            members: data.members || [],
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

        const maxOrder = +snapshot.empty ? 0 : (snapshot.docs[0].data().order ?? 0) + 1;

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
        const actorId = userId;
        const actorName = req.user?.username;
        emitToBoard(docRef.id, "boards:created", { ...board, actorId, actorName });
        emitToBoard(docRef.id, "activity", {
            scope: "board",
            action: "created",
            boardId: docRef.id,
            actorId: userId,
            actorName: req.user?.username,
            message: `${req.user?.username || "Someone"} created board "${name}"`,
        });
        uniqueMembers.forEach((uid) => {
            emitToUser(uid, "boards:created", { ...board, actorId, actorName });
        });
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

        const payload = { id: boardId, ...updatedData };
        const actorId = req.user?.id;
        const actorName = req.user?.username;
        emitToBoard(boardId, "boards:updated", { ...payload, actorId, actorName });
        emitToBoard(boardId, "activity", {
            scope: "board",
            action: "updated",
            boardId,
            actorId: req.user.id,
            actorName: req.user?.username,
            message: `${req.user?.username || "Someone"} updated board`,
        });
        (existingData.members || []).forEach((uid) => {
            emitToUser(uid, "boards:updated", { ...payload, actorId, actorName });
        });
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

        const members = Array.isArray(boardDoc.data().members) ? boardDoc.data().members : [];
        await boardRef.delete();
        const actorId = req.user?.id;
        const actorName = req.user?.username;
        emitToBoard(boardId, "boards:deleted", { id: boardId, actorId, actorName });
        emitToBoard(boardId, "activity", {
            scope: "board",
            action: "deleted",
            boardId,
            actorId: req.user?.id,
            actorName: req.user?.username,
            message: `${req.user?.username || "Someone"} deleted a board`,
        });
        members.forEach((uid) => {
            emitToUser(uid, "boards:deleted", { id: boardId, actorId, actorName });
        });
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting board", err);
        res.status(500).json({ error: "Failed to delete board" });
    }
};

async function findUserIdByEmail(email) {
    const qs = await usersCollection.where("email", "==", email).limit(1).get();
    console.log("qs", qs);
    if (qs.empty) return null;
    return qs.docs[0].id;
}

const inviteToBoard = async (req, res) => {
    try {
        const nameUser = req.user.username;
        const boardOwnerId = req.user.id;
        const boardId = req.params.id;
        const { emailMember, status = "pending" } = req.body;

        const boardDoc = await boardsCollection.doc(boardId).get();
        if (!boardDoc.exists) return res.status(404).json({ error: "Board not found" });

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

        // Gửi email (không chặn luồng socket)
        const emailResult = await sendInviteEmail(emailMember, boardName, inviteId, boardId, nameUser);
        if (!emailResult.success) console.error("Failed to send invite email:", emailResult.error);

        // --- SOCKET ---
        // a) Thông báo cho inviter (toast: sent)
        emitToUser(boardOwnerId, "invites:sent", {
            inviteId,
            boardId,
            emailMember,
            invitedBy: boardOwnerId,
            status: "pending",
            type: "board",
        });

        // b) Thông báo cho invitee (toast: received) nếu đã có tài khoản
        const targetUserId = await findUserIdByEmail(emailMember);
        console.log("targetUserId", targetUserId);
        if (targetUserId) {
            emitToUser(targetUserId, "invites:received", {
                inviteId,
                boardId,
                boardName,
                emailMember,
                invitedBy: boardOwnerId,
                status: "pending",
                type: "board",
            });
        }

        // c) Đồng bộ UI trong room board (không toast)
        emitToBoard(boardId, "boards:memberInvited", {
            boardId,
            inviteId,
            emailMember,
            invitedBy: boardOwnerId,
            status: "pending",
        });

        res.status(201).json(newInvite);
    } catch (err) {
        console.error("Error inviting to board:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
};

const acceptBoardInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        const memberId = req.user.id;

        const inviteSnapshot = await invitesCollection.doc(inviteId).get();
        if (!inviteSnapshot.exists) return res.status(404).json({ error: "Invite not found" });

        const inviteData = inviteSnapshot.data();
        if (inviteData.status !== "pending") {
            return res.status(400).json({ error: "Invite has already been responded to" });
        }

        await invitesCollection.doc(inviteId).update({ status: "accepted", memberId });

        const boardRef = boardsCollection.doc(inviteData.boardId);
        await boardRef.update({ members: admin.firestore.FieldValue.arrayUnion(memberId) });

        const acceptedInfo = {
            inviteId,
            boardId: inviteData.boardId,
            memberId,
            emailMember: inviteData.emailMember,
            status: "accepted",
            invitedBy: inviteData.boardOwnerId,
        };

        // --- SOCKET ---
        // a) Invitee (toast: join success)
        emitToUser(memberId, "invites:accepted", acceptedInfo);

        // b) Inviter (toast: someone joined)
        emitToUser(inviteData.boardOwnerId, "invites:acceptedNotify", acceptedInfo);

        // c) Đồng bộ UI room board (không toast)
        emitToBoard(inviteData.boardId, "boards:memberJoined", {
            boardId: inviteData.boardId,
            memberId,
        });

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

                let avatar = null;
                if (userData.avatar) {
                    avatar = userData.avatar;
                } else {
                    // default: chữ cái đầu tên
                    const firstLetter = (userData.username || "U").charAt(0).toUpperCase();
                    avatar = `https://ui-avatars.com/api/?name=${firstLetter}&background=random`;
                }

                allMembers.push({
                    id: memberId,
                    username: userData.username || "Unknown",
                    avatar,
                });
            } else {
                allMembers.push({
                    id: memberId,
                    username: "Unknown",
                    avatar: "https://ui-avatars.com/api/?name=U&background=random",
                });
            }
        }

        res.status(200).json({ members: allMembers });
    } catch (err) {
        console.error("getMembersOfBoard error:", err);
        res.status(500).json({ error: "Failed to get board members" });
    }
};

const leaveBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user.id;

        const boardRef = boardsCollection.doc(boardId);
        const boardDoc = await boardRef.get();
        if (!boardDoc.exists) return res.status(404).json({ error: "Board not found" });

        const data = boardDoc.data();
        const members = Array.isArray(data.members) ? data.members : [];
        if (data.ownerId === userId) {
            return res.status(400).json({ error: "Owner cannot leave their own board" });
        }
        if (!members.includes(userId)) {
            return res.status(400).json({ error: "You are not a member of this board" });
        }

        await boardRef.update({ members: admin.firestore.FieldValue.arrayRemove(userId) });

        const actorId = req.user?.id;
        const actorName = req.user?.username;

        // Notify board room and users
        emitToBoard(boardId, "boards:memberLeft", { boardId, memberId: userId, actorId, actorName });
        members.forEach((uid) => {
            emitToUser(uid, "boards:updated", { id: boardId, actorId, actorName });
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("leaveBoard error:", err);
        return res.status(500).json({ error: "Failed to leave board" });
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
    getMembersOfBoard,
    leaveBoard,
};
