import { Icon } from "@iconify/react";
import { logoTrello } from "../assets/global/index";

const Header = ({ username = "Board Management", style = {}, isShow = true }) => {
    return (
        <div
            className="position-fixed top-0 start-0 end-0 d-flex justify-content-between align-items-center px-4"
            style={{
                ...style,
                height: "60px",
                borderBottom: "3px solid #3399ff", // viền xanh nhấn mạnh
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                zIndex: 1030,
            }}
        >
            {/* Logo + Title */}
            <div className="d-flex align-items-center gap-2">
                <img src={logoTrello} alt="Logo" style={{ height: "45px" }} />
            </div>

            {/* Right side */}
            <div className="d-flex align-items-center gap-3">
                <Icon
                    icon="material-symbols:notifications"
                    width="24"
                    style={{
                        cursor: "pointer",
                        color: "#555",
                        transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#3399ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                />

                <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                        width: 36,
                        height: 36,
                        backgroundColor: "#3399ff",
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#267acc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3399ff")}
                >
                    {username.charAt(0).toUpperCase()}
                </div>
                {/* <span style={{ fontWeight: "600", fontSize: "1.1rem", color: "#333" }}>{username}</span> */}
            </div>
        </div>
    );
};

export default Header;
