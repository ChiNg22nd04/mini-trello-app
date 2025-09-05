export const safeLabel = (u) => u?.username || u?.name || u?.displayName || u?.email || String(u?.id || "U");

export const getInitial = (name) => {
    const s = String(name || "").trim();
    if (!s) return "U";
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .charAt(0)
        .toUpperCase();
};
