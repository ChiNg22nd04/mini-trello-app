import { Icon } from "@iconify/react";

// Sidebar.jsx (thay đổi giao diện)
const Sidebar = ({ active, fullHeight = false, title }) => {
    return (
        <div style={sidebarStyle}>
            <div style={sidebarHeaderStyle}>
                <Icon className="text-primary" icon="material-symbols:bar-chart-4-bars" width="28" />
                <h5 className="m-0 ps-2 fw-bold text-dark">{title}</h5>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item mb-2">
                    <a
                        href="#"
                        style={{
                            ...navLinkStyle,
                            ...(active === "boards" ? navLinkActive : {}),
                        }}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...navLinkStyle, ...navLinkHover })}
                        onMouseLeave={(e) =>
                            Object.assign(e.currentTarget.style, {
                                ...navLinkStyle,
                                ...(active === "boards" ? navLinkActive : {}),
                            })
                        }
                    >
                        <Icon style={{ width: "22px", height: "22px", marginRight: "7px" }} icon="material-symbols:group" />
                        All Members
                    </a>
                </li>
            </ul>
        </div>
    );
};

const sidebarStyle = {
    backgroundColor: "#fff",
    borderRight: "1px solid #eee",
    padding: "1rem",
    height: "100%",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const sidebarHeaderStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "1.5rem",
};

const navLinkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    color: "#333",
    fontWeight: 500,
    textDecoration: "none",
    transition: "background 0.2s",
};

const navLinkHover = {
    background: "#f1f5f9",
};

const navLinkActive = {
    background: "#e6f0ff",
    color: "#0066cc",
    fontWeight: "bold",
};

export default Sidebar;
