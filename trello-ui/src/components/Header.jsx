import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { logoTrello } from "../assets/global/index";
import useUser from "../hooks/useUser";
import { UserMenu } from "./index";

const Header = ({ style = {} }) => {
    const { user, email, displayName, logout } = useUser();
    const [visible, setVisible] = useState(true);
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY === 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const onDocClick = (e) => {
            if (open && menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onEsc = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    const avatar = user?.avatar;

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
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                zIndex: 1030,
                borderRadius: "16px",
            }}
        >
            {/* Logo */}
            <div className="d-flex align-items-center gap-2">
                <img src={logoTrello} alt="Logo" style={{ height: "55px" }} />
            </div>

            {/* Right side */}
            <div className="d-flex align-items-center gap-3">
                <Icon
                    icon="material-symbols:notifications"
                    width="28"
                    style={{ cursor: "pointer", color: "#555", transition: "0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#3399ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                />

                {/* Avatar / Initial button */}
                <UserMenu avatar={avatar} name={displayName} email={email} onLogout={logout} />
            </div>
        </div>
    );
};

export default Header;
