import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { logoTrello } from "../assets/global/index";

const Header = ({ username = "Board Management", style = {} }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0) {
                setVisible(true); // ở top -> hiện
            } else {
                setVisible(false); // cuộn xuống -> ẩn
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className="position-fixed top-0 start-0 end-0 d-flex justify-content-between align-items-center"
            style={{
                ...style,
                transform: visible ? "translateY(0)" : "translateY(-115%)",
                transition: "transform 0.3s ease-in-out",
                padding: "0px 2.375rem",
                margin: "10px 20px",
                height: "65px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                zIndex: 1030,
                borderRadius: "16px",
            }}
        >
            {/* Logo + Title */}
            <div className="d-flex align-items-center gap-2">
                <img src={logoTrello} alt="Logo" style={{ height: "55px" }} />
            </div>

            {/* Right side */}
            <div className="d-flex align-items-center gap-3">
                <Icon
                    icon="material-symbols:notifications"
                    width="28"
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
                        width: 40,
                        height: 40,
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
            </div>
        </div>
    );
};

export default Header;
