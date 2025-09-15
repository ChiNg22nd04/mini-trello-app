const { db } = require("../firebase");

// GET /boards/:id/activities?scope=&cardId=&taskId=&limit= (kept for compatibility)
const getActivities = async (req, res) => {
    try {
        const boardId = req.params.id;
        const { scope, cardId, taskId } = req.query;
        const limitParam = parseInt(req.query.limit, 10);
        const limitNum = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : 50;

        if (!boardId) return res.status(400).json({ error: "Missing boardId" });

        let ref = db.collection("boards").doc(boardId).collection("activities");

        if (scope) ref = ref.where("scope", "==", String(scope));
        if (cardId) ref = ref.where("cardId", "==", String(cardId));
        if (taskId) ref = ref.where("taskId", "==", String(taskId));

        const snapshot = await ref.orderBy("createdAt", "desc").limit(limitNum).get();
        const activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return res.status(200).json({ success: true, data: activities });
    } catch (err) {
        console.error("getActivities error:", err);
        return res.status(500).json({ error: "Failed to get activities" });
    }
};

// GET /boards/:boardId/cards/:cardId/activities?scope=&taskId=&limit=
const getCardActivities = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { scope, taskId } = req.query;
        const limitParam = parseInt(req.query.limit, 10);
        const limitNum = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : 50;

        if (!cardId) return res.status(400).json({ error: "Missing cardId" });

        let ref = db.collection("cards").doc(cardId).collection("activities");
        if (scope) ref = ref.where("scope", "==", String(scope));
        if (taskId) ref = ref.where("taskId", "==", String(taskId));

        const snapshot = await ref.orderBy("createdAt", "desc").limit(limitNum).get();
        const activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json({ success: true, data: activities });
    } catch (err) {
        console.error("getCardActivities error:", err);
        return res.status(500).json({ error: "Failed to get card activities" });
    }
};

module.exports = { getActivities, getCardActivities };
