import { Icon } from "@iconify/react";

const TopSideBar = ({ boardName = "Board Management", style = {}, className = {} }) => {
    return (
        <di className={`${className}`} style={{ ...style }}>
            <p className="m-0">{boardName}</p>
            <div className="d-flex align-items-center px-2 py-1 border rounded" style={{ background: "#1e252a" }}>
                <Icon icon="material-symbols:account-circle" width="24" />
                <span className="ms-2">Invite member</span>
            </div>
        </di>
    );
};

export default TopSideBar;
