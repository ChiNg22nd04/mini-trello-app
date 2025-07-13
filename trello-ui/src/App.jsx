import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/Login";
import AuthPage from "./pages/Auth";
import BoardPage from "./pages/Board";
import CardPage from "./pages/Card";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/auth/verify" element={<AuthPage />} />
                <Route path="/boards" element={<BoardPage />} />
                <Route path="/boards/:id" element={<CardPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
