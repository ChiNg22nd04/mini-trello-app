import { Icon } from "@iconify/react";
import { logo } from "../assets/global/index";

const Header = ({ username = "Board Management", style = {} }) => {
    return (
        <div className="position-fixed top-0 start-0 end-0 d-flex justify-content-between align-items-center bg-dark text-white px-4 border-bottom" style={{ height: "60px", ...style }}>
            <h5 className="m-0 d-flex align-items-center gap-2">
                <Icon icon="material-symbols:dashboard" width="24" />
                <img src={logo} alt="Logo" style={{ height: "28px" }} />
            </h5>
            <div className="d-flex align-items-center gap-3">
                <Icon icon="material-symbols:notifications" width="24" />
                <div className="bg-danger rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                    {username.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

export default Header;
