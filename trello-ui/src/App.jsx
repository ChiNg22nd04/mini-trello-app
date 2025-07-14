import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/Login";
import AuthPage from "./pages/Auth";
import BoardPage from "./pages/Board";
import CardPage from "./pages/Card";
import GithubCallback from "./pages/GithubCallback";
import { ToastContainer } from "react-toastify";
import InviteAcceptPage from "./pages/Board/InviteAcceptPage";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/github" element={<GithubCallback />} />
                <Route path="/auth/verify" element={<AuthPage />} />
                <Route path="/github/callback" element={<GithubCallback />} />
                <Route path="/boards" element={<BoardPage />} />
                <Route path="/boards/:id" element={<CardPage />} />
                <Route path="/invite/:inviteId/accept" element={<InviteAcceptPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
