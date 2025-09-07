import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "./index";

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
                {!isEditing && <Button name="Edit" icon="material-symbols:edit" variant="outline" iconSize={18} size="md" onClick={handleEdit} />}
            </div>

            {isEditing ? (
                <div>
                    <textarea className="input-field" rows={4} placeholder="Add a more detailed description" value={value} onChange={(e) => setValue(e.target.value)} />
                    <div className="mt-2 d-flex justify-content-end" style={{ gap: ".5rem" }}>
                        <Button name="Save" icon="material-symbols:save" variant="primary" iconSize={24} size="md" onClick={handleSave} disabled={isSaving} />
                        <Button name="Cancel" icon="material-symbols:close" variant="redModern" iconSize={24} size="md" onClick={handleCancel} disabled={isSaving} />
                    </div>
                </div>
            ) : (
                <div className="description-area">{description ? description : <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Add a more detailed description</span>}</div>
            )}
        </div>
    );
}
