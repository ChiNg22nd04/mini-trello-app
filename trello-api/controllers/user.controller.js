const { db } = require("../firebase");

const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ msg: "User not found" });
        }

        const userData = userDoc.data();

        res.json({
            id: userDoc.id,
            username: userData.username,
            email: userData.email || "",
            avatar: userData.avatar || "",
            // Các trường khác nếu có
        });
    } catch (err) {
        console.error("Error getting user:", err);
        res.status(500).json({ msg: "Failed to get user" });
    }
};

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { username, email, avatar } = req.body;

    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Cập nhật chỉ các trường được phép
        const updatedData = {};
        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (avatar) updatedData.avatar = avatar;

        await userRef.update(updatedData);

        res.json({ msg: "User updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ msg: "Failed to update user" });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ msg: "User not found" });
        }

        await userRef.delete();
        res.json({ msg: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ msg: "Failed to delete user" });
    }
};

module.exports = { getUserById, updateUser, deleteUser };
