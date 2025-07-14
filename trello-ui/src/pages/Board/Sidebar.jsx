import { Icon } from "@iconify/react";

const Sidebar = ({ active, fullHeight = false, title }) => {
    return (
        <div
            className="bg-dark text-white p-3"
            style={{
                height: fullHeight ? "100%" : "auto",
            }}
        >
            <div className="d-flex align-items-center mb-4 p-2 border border-white rounded-1">
                <Icon
                    className="text-primary"
                    icon="material-symbols:bar-chart-4-bars"
                    width="28"
                />
                <h5 className="m-0 ps-2">{title}</h5>
            </div>
            <ul className="nav flex-column ms-3">
                <li className="nav-item">
                    <a
                        className={`nav-link ${
                            active === "members"
                                ? "active text-white"
                                : "text-light"
                        }`}
                        href="#"
                    >
                        <Icon
                            style={{
                                width: "22px",
                                height: "22px",
                                marginRight: "7px",
                            }}
                            icon="material-symbols:group"
                        />
                        All Members
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
