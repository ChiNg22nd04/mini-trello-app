import { getInitial, safeLabel } from "../../utils/people";

export default function AssignDropdown({ open, onClose, anchor = "left", members = [], selectedIds = [], onToggle }) {
    if (!open) return null;
    const pos = anchor === "left" ? { left: 0 } : { right: 0 };
    return (
        <div className="dropdown" style={{ top: "105%", ...pos }}>
            {members.map((m) => {
                const mid = m.id || m._id || m.uid || m.name || m.email;
                const label = safeLabel(m);
                const avatarUrl = m.avatar || m.photoURL;
                const isSelected = selectedIds.includes(mid);

                return (
                    <div key={mid} className={`dropdown-item ${isSelected ? "selected" : ""}`} onClick={() => onToggle(mid, isSelected)}>
                        <div className="avatar-small">
                            {avatarUrl ? (
                                <img style={{ width: 35, height: 35, backgroundColor: "transparent" }} src={avatarUrl} alt={label} className="rounded-full object-cover" />
                            ) : (
                                getInitial(label)
                            )}
                        </div>
                        <span style={{ fontSize: ".875rem", paddingLeft: ".75rem" }}>{label}</span>
                    </div>
                );
            })}
        </div>
    );
}
