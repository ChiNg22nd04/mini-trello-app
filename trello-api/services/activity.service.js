const { db } = require("../firebase");
const { emitToBoard } = require("../config/socket");

async function addActivity(boardId, activity) {
    try {
        if (!boardId) throw new Error("Missing boardId for activity");
        const data = {
            boardId,
            scope: activity.scope || "board",
            action: activity.action || "updated",
            cardId: activity.cardId || null,
            taskId: activity.taskId || null,
            actorId: activity.actorId || null,
            actorName: activity.actorName || null,
            message: activity.message || "",
            createdAt: Date.now(),
        };
        await db.collection("boards").doc(boardId).collection("activities").add(data);
        emitToBoard(boardId, "activity", data);
        return data;
    } catch (err) {
        console.error("addActivity error:", err?.message || err);
        // Do not throw to avoid breaking main flow; best-effort logging
        return null;
    }
}

module.exports = { addActivity };
