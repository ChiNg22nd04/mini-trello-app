export default function DueDropdown({ open, value, onChange, anchor = "left" }) {
    if (!open) return null;
    const pos = anchor === "left" ? { left: 0 } : { right: 0 };
    return (
        <div className="dropdown" style={{ top: "105%", ...pos }}>
            <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
        </div>
    );
}
