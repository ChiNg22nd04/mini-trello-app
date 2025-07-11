import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { leftImage, rightImage } from "../assets/global/index";
import API_BASE_URL from "../../config/index";

const AuthPage = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        const email = localStorage.getItem("email");
        console.log(email);
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/verify`, {
                params: { email, code },
            });
            console.log(res.data);
            if (!email || !code) {
                setMessage(res.data.msg);
                return;
            }

            if (res.data && res.data.token) {
                localStorage.setItem("accessToken", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/boards");
            } else {
                setMessage("Something went wrong. Please try again.");
            }
        } catch (err) {
            const msg = err.response?.data?.msg || "Verification failed. Try again.";
            setMessage(msg);
        }
    };

    return (
        <div className="bg-light position-relative d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <img src={leftImage} alt="Left" className="position-absolute d-none d-md-block" style={{ bottom: 0, left: 0, width: "25%" }} />
            <img src={rightImage} alt="Right" className="position-absolute d-none d-md-block" style={{ bottom: 0, right: 0, width: "25%" }} />

            <div className="col-md-4 col-10">
                <div className="border rounded p-4 shadow-sm bg-white">
                    <h3 className="mb-3 mt-4 text-center">Email Verification</h3>
                    <p className="text-center m-0 pb-2">Please enter the code sent to your email</p>

                    <input type="text" className="form-control text-center mb-2" placeholder="Enter verification code" value={code} onChange={(e) => setCode(e.target.value)} />

                    {message && (
                        <div className="text-center mb-2">
                            <small className="text-danger" style={{ fontSize: "10px" }}>
                                {message}
                            </small>
                        </div>
                    )}

                    <button onClick={handleSubmit} className="btn btn-primary w-100 mb-3">
                        Submit
                    </button>

                    <small className="text-muted">
                        <p className="text-center mb-1">Privacy Policy</p>
                        <p className="text-center m-0">This site is protected by reCAPTCHA and the Google Privacy</p>
                        <p className="d-flex justify-content-center">
                            <a href="#">Policy and Terms of Service apply.</a>
                        </p>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
