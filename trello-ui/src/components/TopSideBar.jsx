const TopSideBar = ({ boardName = "Board Management", style = {}, className = {} }) => {
    return (
        <p className={`${className}`} style={{ ...style }}>
            {boardName}
        </p>
    );
};

export default TopSideBar;
