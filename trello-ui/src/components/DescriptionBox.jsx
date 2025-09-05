import { Icon } from "@iconify/react";

export default function DescriptionBox({ description }) {
    return (
        <div className="section">
            <div className="section-header mb-2">
                <Icon icon="material-symbols:description" width={24} />
                Description
            </div>
            <div className="description-area">{description || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Add a more detailed description</span>}</div>
        </div>
    );
}
