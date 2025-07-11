import { Icon } from "@iconify/react";

const Sidebar = ({ active, fullHeight = false }) => {
    return (
        <div
            className="bg-dark text-white p-3"
            style={{
                height: fullHeight ? "100%" : "auto",
            }}
        >
            <div className="d-flex align-items-center mb-4">
                <Icon icon="material-symbols:bar-chart-4-bars" width="28" />
                <h5 className="ms-2">Board Management</h5>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <a className={`nav-link ${active === "boards" ? "active text-white" : "text-light"}`} href="#">
                        <Icon icon="material-symbols:dashboard" /> Boards
                    </a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${active === "members" ? "active text-white" : "text-light"}`} href="#">
                        <Icon icon="material-symbols:group" /> All Members
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
