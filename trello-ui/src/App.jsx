import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import AuthPage from "./pages/Auth";
import BoardPage from "./pages/Board";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/auth/verify" element={<AuthPage />} />
                <Route path="/boards" element={<BoardPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
