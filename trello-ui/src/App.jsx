import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import LoginPage from "./pages/Login";
import AuthPage from "./pages/Login/Auth";
import BoardPage from "./pages/Board";
import CardPage from "./pages/Card";
import GithubCallback from "./pages/Login/GithubCallback";
import GoogleCallback from "./pages/Login/GoogleCallback";
import { ToastContainer, toast } from "react-toastify";
import { socket } from "../config";
import { useEffect } from "react";
import InviteAcceptPage from "./pages/Board/InviteAcceptPage";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status;
                if (status === 401) {
                    try {
                        localStorage.removeItem("user");
                        localStorage.removeItem("accessToken");
                    } catch {}
                    window.location.href = "/boards";
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptorId);
    }, []);

    useEffect(() => {
        const onBoardCreated = (data) => {
            const actor = data?.actorName || "someone";
            toast.success(`Board "${data?.name || ""}" created by ${actor}`, { autoClose: 3000 });
        };
        const onBoardUpdated = (data) => {
            const actor = data?.actorName || "someone";
            toast.info(`Board updated by ${actor}`, { autoClose: 3000 });
        };
        const onBoardDeleted = (data) => {
            const actor = data?.actorName || "someone";
            toast.warn(`Board deleted by ${actor}`, { autoClose: 3000 });
        };

        socket.on("boards:created", onBoardCreated);
        socket.on("boards:updated", onBoardUpdated);
        socket.on("boards:deleted", onBoardDeleted);

        return () => {
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
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                {/* <Route path="/github" element={<GithubCallback />} /> */}

                <Route path="/signin" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
