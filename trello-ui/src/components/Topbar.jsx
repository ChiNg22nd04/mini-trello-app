import React from "react";
import { Icon } from "@iconify/react";

const Topbar = () => {
    return (
        <div className="bg-dark d-flex justify-content-end align-items-center p-2 px-4">
            <Icon icon="material-symbols:notifications-rounded" className="text-white me-3" width="22" height="22" />
            <div className="rounded-circle bg-danger text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                SD
            </div>
        </div>
    );
};

export default Topbar;
