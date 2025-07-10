const { db } = require("../firebase");
const { getIO } = require("../config/socket");

// GET /users/:githubId
const getUserByGithubId = async (req, res) => {
    const uId = req.params.uId;
    console.log("uId", uId);

    try {
        const userRef = db.collection("users").doc(uId);
        const userDoc = userRef.get();
        console.log("userDoc", userDoc);
        if (!userDoc.exists) {
            return res.status(404).json({ msg: "User not found" });
        }

        const userData = userDoc.data();
        console.log("userData", userData);
        res.json({
            uId,
            // githubId: userDoc.id,
            username: userData.username,
            email: userData.email || "",
            avatar: userData.avatar || "",
            createdAt: userData.createdAt || null,
        });
    } catch (err) {
        console.error("Error getting user:", err);
        res.status(500).json({ msg: "Failed to get user" });
    }
};

// PUT /users/:githubId
const updateUserByGithubId = async (req, res) => {
    const githubId = req.params.githubId;
    const { username, email, avatar } = req.body;

    try {
        const userRef = db.collection("users").doc(githubId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ msg: "User not found" });
        }

        const updatedData = {};
        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (avatar) updatedData.avatar = avatar;

        await userRef.update(updatedData);

        getIO().emit("userUpdated", {
            githubId,
            updatedFields: updatedData,
        });
        console.log("User updated successfully");

        res.json({ msg: "User updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ msg: "Failed to update user" });
    }
};

// DELETE /users/:githubId
const deleteUserByGithubId = async (req, res) => {
    const githubId = req.params.githubId;

    try {
        const userRef = db.collection("users").doc(githubId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ msg: "User not found" });
        }

        await userRef.delete();
        getIO().emit("userDeleted", { githubId });
        console.log("User deleted successfully");
        res.json({ msg: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ msg: "Failed to delete user" });
    }
};

module.exports = {
    getUserByGithubId,
    updateUserByGithubId,
    deleteUserByGithubId,
};
