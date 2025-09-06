import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";

export default function DescriptionBox({ description = "", onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(description || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = useCallback(() => {
        setValue(description || "");
        setIsEditing(true);
    }, [description]);

    const handleCancel = useCallback(() => {
        setValue(description || "");
        setIsEditing(false);
    }, [description]);

    const handleSave = useCallback(async () => {
        if (typeof onSave !== "function") {
            setIsEditing(false);
            return;
        }
        try {
            setIsSaving(true);
            const next = (value ?? "").trim();
            await onSave(next);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    }, [onSave, value]);

    return (
        <div className="section">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="section-header">
                    <Icon icon="material-symbols:description" width={24} />
                    Description
                </div>
                {!isEditing && (
                    <button className="btn btn-outline" onClick={handleEdit}>
                        <Icon icon="material-symbols:edit" width={18} /> Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div>
                    <textarea className="input-field" rows={4} placeholder="Add a more detailed description" value={value} onChange={(e) => setValue(e.target.value)} />
                    <div className="mt-2 d-flex" style={{ gap: ".5rem" }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button className="btn btn-outline" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="description-area">{description ? description : <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Add a more detailed description</span>}</div>
            )}
        </div>
    );
}
