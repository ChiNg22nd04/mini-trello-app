import { useState, useCallback, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function DescriptionBox({ description = "", onSave }) {
    const [value, setValue] = useState(description || "");

    useEffect(() => {
        setValue(description || "");
    }, [description]);

    const handleBlur = useCallback(async () => {
        if (typeof onSave !== "function") return;
        const next = (value ?? "").trim();
        if (next === (description ?? "")) return;
        try {
            await onSave(next);
        } catch (_) {
            // swallow errors; caller can handle toast/logging if needed
        }
    }, [onSave, value, description]);

    return (
        <div className="section">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="section-header">
                    <Icon icon="material-symbols:description" width={24} />
                    Description
                </div>
            </div>

            <textarea className="input-field" rows={4} placeholder="Add a more detailed description" value={value} onChange={(e) => setValue(e.target.value)} onBlur={handleBlur} />
        </div>
    );
}
