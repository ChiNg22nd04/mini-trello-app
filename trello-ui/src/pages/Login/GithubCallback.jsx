// src/pages/GithubCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const GithubCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGithubUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");

            if (!code) {
                alert("No code found in URL");
                return;
            }

            try {
                const res = await axios.get(
                    `${API_BASE_URL}/github/callback?code=${code}`
                );
                const { token, user } = res.data;

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                navigate("/boards");
            } catch (err) {
                console.error("GitHub login failed", err);
                alert("GitHub login failed");
                navigate("/signin");
            }
        };

        fetchGithubUser();
    }, [navigate]);

    return <p className="text-center mt-5">Continue in with GitHub...</p>;
};

export default GithubCallback;
