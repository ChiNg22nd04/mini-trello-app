import { BoardCard, Sidebar, Header } from "../components";

const BoardPage = () => {
    const headerHeight = "60px";

    return (
        <>
            <Header username="Chi" style={{ height: headerHeight, zIndex: 1030 }} />

            <div
                className="d-flex bg-dark text-white"
                style={{
                    paddingTop: headerHeight,
                    minHeight: "100vh",
                }}
            >
                <div style={{ width: "25%", position: "fixed" }}>
                    <Sidebar active="boards" fullHeight />
                </div>

                <div
                    style={{
                        marginLeft: "25%",
                        width: "75%",
                        overflowY: "auto",
                        padding: "1.5rem",
                    }}
                >
                    <h6 className="text-secondary fw-bold mb-4">YOUR WORKSPACES</h6>
                    <div className="d-flex flex-wrap">
                        <BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" />
                        <BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" /><BoardCard title="My Trello board" />
                        <BoardCard title="+ Create a new board" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoardPage;
