const BoardCard = ({ title, onClick, style }) => {
    return (
        <div className=" bg-white" style={{ width: "100%", minHeight: "100px", cursor: "pointer", ...style }} onClick={onClick}>
            <h6 className="text-dark m-0">{title}</h6>
        </div>
    );
};

export default BoardCard;
