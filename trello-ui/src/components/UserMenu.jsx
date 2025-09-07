import { useEffect, useRef, useState } from "react";
import { UserMeta, Avatar, Button } from "./index";
// Component chứa avatar + dropdown + nút Logout
// Có thể truyền children để hiển thị thêm trong menu nếu cần.
const UserMenu = ({ avatar, name = "User", email = "-", onLogout = () => {}, children }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const initial = (name || "U").charAt(0).toUpperCase();

    // click ra ngoài & ESC để đóng menu
    useEffect(() => {
        const onDocClick = (e) => {
            if (open && menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    return (
        <div className="position-relative" ref={btnRef} style={{ cursor: "pointer" }}>
            {/* Avatar / Initial */}
            <div onClick={() => setOpen((v) => !v)}>
                {avatar ? (
                    <Avatar src={avatar} alt="User Avatar" size={40} border="2px solid #3399ff" />
                ) : (
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#3399ff",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                        }}
                    >
                        {initial}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div
                    ref={menuRef}
                    className="position-absolute"
                    style={{
                        right: 0,
                        marginTop: 10,
                        width: 280,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        padding: 12,
                        zIndex: 2000,
                    }}
                >
                    {/* Info */}
                    <div className="d-flex align-items-center gap-3" style={{ padding: "8px 8px 12px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        {avatar ? (
                            <Avatar src={avatar} alt="User Avatar" size={38} />
                        ) : (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                    width: 44,
                                    height: 44,
                                    backgroundColor: "#3399ff",
                                    color: "#fff",
                                    fontWeight: 700,
                                }}
                            >
                                {initial}
                            </div>
                        )}
                        <UserMeta name={name} email={email} />
                    </div>

                    {/* Optional extra (Profile/Settings...) */}
                    {children && <div style={{ paddingTop: 8 }}>{children}</div>}

                    {/* Actions */}
                    <div style={{ paddingTop: 8 }}>
                        <Button
                            name="Logout"
                            variant="redModern"
                            color="#b91c1c"
                            size="md"
                            style={{ width: "100%" }}
                            onClick={() => {
                                setOpen(false);
                                onLogout?.();
                            }}
                        />
                        {/* <button
                            onClick={() => {
                                setOpen(false);
                                onLogout?.();
                            }}
                            className="w-100"
                            style={{
                                width: "100%",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                borderRadius: 10,
                                padding: "10px 12px",
                                fontWeight: 600,
                            }}
                        >
                            Logout
                        </button> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
