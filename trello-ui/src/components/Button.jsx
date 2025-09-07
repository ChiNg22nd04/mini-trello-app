import React from "react";
import { Icon } from "@iconify/react";

const Button = ({
    icon,
    name,
    iconSize = 16,
    color = "#3399ff",
    backgroundColor,
    variant = "primary", // primary, secondary, outline, ghost
    size = "md", // sm, md, lg
    onClick,
    disabled = false,
    loading = false,
    className = "",
    style = {},
    ...props
}) => {
    // Predefined color schemes
    const colorSchemes = {
        primary: {
            background: "linear-gradient(135deg, #3399ff 0%, #059669 100%)",
            color: "#fff",
            hoverBg: "linear-gradient(135deg, #2987e6 0%, #047a56 100%)",
            shadowColor: "rgba(51, 153, 255, 0.3)",
        },
        blueModern: {
            background: "rgba(51, 153, 255, 0.05)",
            color: "#3399ff",
            hoverBg: "#3399ff",
            hoverColor: "#fff",
            border: "1px solid rgba(51, 153, 255, 0.1)",
            shadowColor: "rgba(51, 153, 255, 0.2)",
        },
        greenModern: {
            background: "rgba(0, 128, 0, 0.05)",
            color: "#059669",
            hoverBg: "#059669",
            hoverColor: "#fff",
            border: "1px solid rgba(0, 128, 0, 0.1)",
            shadowColor: "rgba(0, 128, 0, 0.2)",
        },
        redModern: {
            background: "#fee2e2",
            color: "#b91c1c",
            hoverBg: "#b91c1c",
            hoverColor: "#fff",
            border: "1px solid #fecaca",
            shadowColor: "rgba(255, 0, 0, 0.2)",
        },
        outline: {
            background: "transparent",
            color: color,
            hoverBg: color,
            hoverColor: "#fff",
            border: `1px solid ${color}`,
            shadowColor: `${color}33`,
        },
        ghost: {
            background: "transparent",
            color: color,
            hoverBg: `${color}15`,
            shadowColor: `${color}20`,
        },
    };

    // Size configurations
    const sizeConfigs = {
        sm: {
            padding: "6px 12px",
            fontSize: "12px",
            height: "32px",
            minWidth: name ? "auto" : "32px",
        },
        md: {
            padding: "8px 16px",
            fontSize: "14px",
            height: "40px",
            minWidth: name ? "auto" : "40px",
        },
        lg: {
            padding: "12px 20px",
            fontSize: "16px",
            height: "48px",
            minWidth: name ? "auto" : "48px",
        },
    };

    const currentScheme = colorSchemes[variant];
    const currentSize = sizeConfigs[size];

    // Custom background color override
    const finalBackground = backgroundColor || currentScheme.background;

    const buttonStyles = {
        border: currentScheme.border || "none",
        borderRadius: "12px",
        padding: currentSize.padding,
        fontWeight: "600",
        fontSize: currentSize.fontSize,
        height: currentSize.height,
        minWidth: currentSize.minWidth,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: name ? "8px" : "0",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: finalBackground,
        color: currentScheme.color,
        boxShadow: `0 2px 8px ${currentScheme.shadowColor}`,
        opacity: disabled ? 0.6 : 1,
        ...style,
    };

    const handleMouseEnter = (e) => {
        if (disabled) return;

        const target = e.currentTarget;
        if (currentScheme.hoverBg) {
            target.style.background = currentScheme.hoverBg;
        }
        if (currentScheme.hoverColor) {
            target.style.color = currentScheme.hoverColor;
        }
        target.style.transform = "translateY(-2px)";
        target.style.boxShadow = `0 4px 12px ${currentScheme.shadowColor}`;
    };

    const handleMouseLeave = (e) => {
        if (disabled) return;

        const target = e.currentTarget;
        target.style.background = finalBackground;
        target.style.color = currentScheme.color;
        target.style.transform = "translateY(0)";
        target.style.boxShadow = `0 2px 8px ${currentScheme.shadowColor}`;
    };

    const handleMouseDown = (e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
    };

    const handleMouseUp = (e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
    };

    const handleClick = (e) => {
        if (disabled || loading) return;
        if (onClick) onClick(e);
    };

    return (
        <button
            className={`btn-custom ${className}`}
            style={buttonStyles}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            disabled={disabled}
            {...props}
        >
            {/* Ripple effect overlay */}
            <span
                style={{
                    content: "",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "all 0.3s ease",
                    pointerEvents: "none",
                }}
                className="ripple-effect"
            />

            {/* Loading spinner */}
            {loading && <Icon icon="eos-icons:loading" width={iconSize} style={{ marginRight: name ? "4px" : 0 }} />}

            {/* Icon */}
            {icon && !loading && <Icon icon={icon} width={iconSize} />}

            {/* Text */}
            {name && <span>{name}</span>}

            <style jsx>{`
                .btn-custom:hover .ripple-effect {
                    width: 120%;
                    height: 120%;
                }
            `}</style>
        </button>
    );
};

export default Button;
