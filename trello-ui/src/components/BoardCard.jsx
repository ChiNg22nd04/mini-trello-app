const BoardCard = ({ title, onClick }) => {
    return (
        <div className="border rounded bg-white p-3 me-3 mb-3" style={{ width: "200px", cursor: "pointer" }} onClick={onClick}>
            <h6>{title}</h6>
        </div>
    );
};

export default BoardCard;
