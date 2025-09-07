import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/Login";
import AuthPage from "./pages/Login/Auth";
import BoardPage from "./pages/Board";
import CardPage from "./pages/Card";
import GithubCallback from "./pages/Login/GithubCallback";
import { ToastContainer, toast } from "react-toastify";
import { socket } from "../config";
import { useEffect } from "react";
import InviteAcceptPage from "./pages/Board/InviteAcceptPage";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
    useEffect(() => {
        const onActivity = (payload) => {
            const text = payload?.message || "Có cập nhật mới";
            toast.info(text, { autoClose: 3000 });
        };
        const onBoardCreated = (data) => toast.success(`Bảng "${data?.name || ""}" đã được tạo`, { autoClose: 3000 });
        const onBoardUpdated = () => toast.info("Bảng đã được cập nhật", { autoClose: 3000 });
        const onBoardDeleted = () => toast.warn("Bảng đã bị xoá", { autoClose: 3000 });

        socket.on("activity", onActivity);
        socket.on("boards:created", onBoardCreated);
        socket.on("boards:updated", onBoardUpdated);
        socket.on("boards:deleted", onBoardDeleted);

        return () => {
            socket.off("activity", onActivity);
            socket.off("boards:created", onBoardCreated);
            socket.off("boards:updated", onBoardUpdated);
            socket.off("boards:deleted", onBoardDeleted);
        };
    }, []);

    return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            <Routes>
                <Route path="/boards/:id/invite/:inviteId/accept" element={<InviteAcceptPage />} />
                <Route path="/boards/:id" element={<CardPage />} />
                <Route path="/boards" element={<BoardPage />} />

                <Route path="/auth/verify" element={<AuthPage />} />

                <Route path="/auth/github/callback" element={<GithubCallback />} />
                {/* <Route path="/github" element={<GithubCallback />} /> */}

                <Route path="/signin" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
