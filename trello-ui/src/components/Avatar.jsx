import React, { useEffect, useState } from "react";

const Avatar = ({
    src,
    alt = "User Avatar",
    size = 40, // kích thước mặc định 40px
    border = "2px solid #fff",
    boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.05)",
    className = "",
    style = {},
}) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    const handleError = () => {
        // Fallback to initials avatar service if external avatar fails
        const initial = (alt && typeof alt === "string" && alt.length > 0 ? alt.charAt(0) : "U").toUpperCase();
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=random&color=fff`;
        if (imgSrc !== fallback) setImgSrc(fallback);
    };

    return (
        <img
            src={imgSrc}
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
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleError}
            loading="lazy"
        />
    );
};

export default Avatar;
