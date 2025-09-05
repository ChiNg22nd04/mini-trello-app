import React from "react";

const Avatar = ({
    src,
    alt = "User Avatar",
    size = 40, // kích thước mặc định 40px
    border = "2px solid #fff",
    boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.05)",
    className = "",
    style = {},
}) => {
    return (
        <img
            src={src}
            alt={alt}
            className={`rounded-circle ${className}`}
            style={{
                width: size,
                height: size,
                objectFit: "cover",
                borderRadius: "50%",
                border,
                boxShadow,
                ...style,
            }}
        />
    );
};

export default Avatar;
