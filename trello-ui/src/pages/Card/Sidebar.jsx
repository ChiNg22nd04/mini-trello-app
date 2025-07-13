import { Icon } from "@iconify/react";

const Sidebar = ({ active, fullHeight = false, title, members = [] }) => {
    return (
        <div
            className="bg-dark text-white p-3"
            style={{
                height: fullHeight ? "100%" : "auto",
            }}
        >
            <div className="d-flex align-items-center mb-2 p-2 justify-content-between">
                <h5 className="m-0 fw-normal">Your boards</h5>
                <Icon icon="mdi:dots-horizontal" width="28" />
            </div>
            <div className="d-flex align-items-center p-2 mb-1">
                <Icon icon="material-symbols:folder-open" width="23" />
                <p
                    className="m-0 ps-2 fw-normal fs-6 "
                    style={{
                        maxWidth: "90%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {title}
                </p>
            </div>
            <ul className="nav flex-column" style={{ marginLeft: "35px" }}>
                <ul className="nav-item p-0">
                    <li className="mb-2 d-flex align-items-center mb-1">
                        <Icon style={{ width: "22px", height: "22px", marginRight: "7px" }} icon="material-symbols:person" />
                        Members
                    </li>
                    {members.map((member) => (
                        <li className="mb-1 d-flex align-items-center ms-3 py-1 mb-1">
                            <div className="bg-danger rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px" }}>
                                {member.charAt(0).toUpperCase()}
                            </div>
                            <p className="m-0 ps-2 fw-normal fs-6" style={{ maxWidth: "65%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {member}
                            </p>
                        </li>
                    ))}
                </ul>
            </ul>
        </div>
    );
};

export default Sidebar;
