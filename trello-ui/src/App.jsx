import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/Login";
import AuthPage from "./pages/Login/Auth";
import BoardPage from "./pages/Board";
import CardPage from "./pages/Card";
import GithubCallback from "./pages/Login/GithubCallback";
import { ToastContainer } from "react-toastify";
import InviteAcceptPage from "./pages/Board/InviteAcceptPage";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar
            />

            <Routes>
                <Route
                    path="/boards/:id/invite/:inviteId/accept"
                    element={<InviteAcceptPage />}
                />
                <Route path="/boards/:id" element={<CardPage />} />
                <Route path="/boards" element={<BoardPage />} />

                <Route path="/auth/verify" element={<AuthPage />} />

                <Route
                    path="/auth/github/callback"
                    element={<GithubCallback />}
                />
                {/* <Route path="/github" element={<GithubCallback />} /> */}

                <Route path="/signin" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
