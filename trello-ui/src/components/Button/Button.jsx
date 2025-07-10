import React from "react";
import { Icon } from "@iconify/react";
import "./Button.css";

const Button = ({ variant = "primary", children, icon, iconColor, disabled = false, onClick, className = "", badge, ...props }) => {
    const buttonClass = `
        button
        button-${variant} 
        ${className}
    `.trim();

    return (
        <button type="button" className={buttonClass} onClick={onClick} disabled={disabled} {...props}>
            {icon && <Icon icon={icon} className={`button-icon ${iconColor ? `${iconColor}-icon` : ""}`} />}
            <span>{children}</span>
            {badge && <span className="button-badge">{badge}</span>}
        </button>
    );
};

export default Button;
