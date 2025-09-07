import { Icon } from "@iconify/react";

const BoardCard = ({ title, description, createdAt, membersCount, onClick, style, badge, badgeColor }) => {
    const formatDate = (value) => {
        if (!value) return "—";
        try {
            let date;
            if (value instanceof Date) {
                date = value;
            } else if (typeof value?.toDate === "function") {
                date = value.toDate();
            } else if (typeof value === "object" && (typeof value.seconds === "number" || typeof value._seconds === "number")) {
                const secs = typeof value.seconds === "number" ? value.seconds : value._seconds;
                date = new Date(secs * 1000);
            } else if (typeof value === "number" || typeof value === "string") {
                date = new Date(value);
            } else {
                return "—";
            }
            return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
        } catch {
            return "—";
        }
    };
    return (
        <div
            className=" bg-white"
            style={{
                width: "100%",
                minHeight: "120px",
                height: "100%",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                ...style,
            }}
            onClick={onClick}
        >
            {badge ? (
                <span
                    style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "0px",
                        padding: "4px 10px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        background: badgeColor || "#3b82f6",
                        borderRadius: "8px",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                    }}
                >
                    {badge}
                </span>
            ) : null}
            <div>
                <h5 className="text-dark mt-2" style={{ marginBottom: "8px" }}>
                    {title}
                </h5>
                {description ? (
                    <p
                        className="mt-1"
                        style={{ color: "#64748b", margin: 0, fontSize: "0.9rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                        {description}
                    </p>
                ) : (
                    <p className="mt-1" style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
                        No description
                    </p>
                )}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px",
                        marginBottom: "8px",
                        marginRight: "56px",
                        color: "#64748b",
                        fontSize: "0.8rem",
                    }}
                >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Icon icon="mdi:calendar" width={22} height={22} />
                        {formatDate(createdAt)}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Icon icon="mdi:account-multiple" width={22} height={22} />
                        {typeof membersCount === "number" ? membersCount : 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;
