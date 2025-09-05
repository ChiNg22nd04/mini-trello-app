import { Icon } from "@iconify/react";

export default function CardHeader({ title, listName }) {
    return (
        <div className="card-header d-flex" style={{ alignItems: "center", gap: ".75rem", paddingRight: "3rem", borderRight: "1px solid #e5e7eb" }}>
            <div>
                <h1 className="card-title">{title}</h1>
                <p className="card-subtitle">
                    in list <strong style={{ color: "#1d4ed8" }}>{listName}</strong>
                </p>
            </div>
        </div>
    );
}
