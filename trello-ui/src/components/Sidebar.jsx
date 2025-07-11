import React from "react";
import { logo } from "../assets/global/index";
import { Icon } from "@iconify/react";

const Sidebar = () => {
    return (
        <div className="bg-dark text-white p-3 vh-100" style={{ width: "220px" }}>
            <div className="d-flex align-items-center mb-4">
                <img src={logo} alt="Logo" style={{ height: "28px" }} />
            </div>
            <div className="mb-3">
                <div className="d-flex align-items-center p-2 rounded bg-secondary">
                    <Icon icon="material-symbols:bar-chart-4-bars" className="me-2" />
                    Boards
                </div>
            </div>
            <div>
                <div className="d-flex align-items-center p-2 text-white-50">
                    <Icon icon="material-symbols:groups" className="me-2" />
                    All Members
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
