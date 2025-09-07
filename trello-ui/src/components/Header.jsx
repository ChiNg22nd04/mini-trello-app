import { useEffect, useRef, useState } from "react";
import { logoTrello } from "../assets/global/index";
import useUser from "../hooks/useUser";
import { UserMenu, Button } from "./index";

const Header = ({ style = {} }) => {
    const { user, email, displayName, logout } = useUser();
    const [visible, setVisible] = useState(true);
    const [open, setOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setVisible(scrollY < 100);
            setIsScrolled(scrollY > 10);
        };
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
        <header
            className="position-fixed top-0 start-0 end-0 d-flex justify-content-between align-items-center"
            style={{
                ...style,
                transform: visible ? "translateY(0)" : "translateY(-100%)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: "12px 24px",
                margin: "16px 24px",
                height: "72px",
                background: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 1)",
                backdropFilter: isScrolled ? "blur(12px)" : "none",
                border: "1px solid rgba(51, 153, 255, 0.1)",
                boxShadow: isScrolled ? "0 8px 32px rgba(51, 153, 255, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)" : "0 4px 20px rgba(51, 153, 255, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                zIndex: 1030,
                borderRadius: "20px",
                maxWidth: "calc(100vw - 48px)",
            }}
        >
            {/* Logo Section */}
            <div className="d-flex align-items-center gap-2">
                <img src={logoTrello} alt="Logo" style={{ height: "55px" }} />
            </div>

            {/* Center Search */}
            {/* <div
                className="d-none d-md-flex align-items-center"
                style={{
                    flex: "1",
                    maxWidth: "400px",
                    margin: "0 24px",
                }}
            >
                <Button
                    icon="material-symbols:search"
                    name="Search boards, cards..."
                    variant="ghost"
                    size="md"
                    iconSize={20}
                    style={{
                        width: "100%",
                        justifyContent: "flex-start",
                        color: "#999",
                        background: "rgba(51, 153, 255, 0.05)",
                        border: "1px solid rgba(51, 153, 255, 0.1)",
                    }}
                    onClick={() => console.log("Open search")}
                />
            </div> */}

            {/* Right side actions */}
            <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                {/* Notifications - chỉ icon, không có text */}
                <div className="d-none d-md-block">
                    <Button icon="material-symbols:notifications-outline" variant="blueModern" size="md" iconSize={22} onClick={() => console.log("Notifications clicked")} />
                </div>

                {/* Apps menu - chỉ icon với màu custom */}
                <div className="d-none d-md-block">
                    <Button icon="material-symbols:apps" variant="greenModern" size="md" iconSize={22} onClick={() => console.log("Apps clicked")} />
                </div>

                {/* User Menu */}
                <div style={{ marginLeft: "8px" }}>
                    <UserMenu avatar={avatar} name={displayName} email={email} onLogout={logout} />
                </div>
            </div>
        </header>
    );
};

export default Header;
