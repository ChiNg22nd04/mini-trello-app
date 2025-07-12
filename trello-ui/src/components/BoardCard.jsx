const BoardCard = ({ title, onClick }) => {
    return (
        <div className="border rounded bg-white p-3" style={{ width: "100%", minHeight: "100px", cursor: "pointer" }} onClick={onClick}>
            <h6 className="text-dark m-0">{title}</h6>
        </div>
    );
};

export default BoardCard;
