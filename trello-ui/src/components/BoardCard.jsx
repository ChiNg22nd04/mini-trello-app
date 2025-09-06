const BoardCard = ({ title, description, onClick, style }) => {
    return (
        <div className=" bg-white" style={{ width: "100%", minHeight: "120px", cursor: "pointer", ...style }} onClick={onClick}>
            <h6 className="text-dark m-0" style={{ marginBottom: "8px" }}>
                {title}
            </h6>
            {description ? (
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {description}
                </p>
            ) : (
                <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>No description</p>
            )}
        </div>
    );
};

export default BoardCard;
