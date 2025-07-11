import React, { useState } from "react";
import axios from "axios";
import { leftImage, rightImage, logo } from "../assets/global/index";
import API_BASE_URL from "../../config/index";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    console.log("LoginPage rendering...");
    console.log("leftImage:", leftImage);
    console.log("rightImage:", rightImage);
    console.log("logo:", logo);
    console.log("API_BASE_URL:", API_BASE_URL);

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/signin`, { email });
            if (res.data && res.data.msg) setMessage(res.data.msg);
            else {
                localStorage.setItem("email", email);
                navigate("/auth/verify");
            }
        } catch (err) {
            console.log(err);
            setMessage("Please try again.");
        }
    };

    return (
        <div className="bg-light position-relative d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <img src={leftImage} alt="Left" className="position-absolute d-none d-md-block" style={{ bottom: 0, left: 0, width: "25%" }} />
            <img src={rightImage} alt="Right" className="position-absolute d-none d-md-block" style={{ bottom: 0, right: 0, width: "25%" }} />

            <div className="col-md-4 col-10">
                <div className="border rounded p-4 shadow-sm bg-white">
                    <div className="mb-2 d-flex flex-column align-items-center">
                        <img src={logo} alt="Logo" style={{ width: "56px", height: "56px" }} />
                    </div>

                    <h6 className="mb-3 text-center text-muted">Log in to continue</h6>

                    <div className="mb-2">
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control text-center" placeholder="Enter your email" />
                    </div>

                    {message && (
                        <div className="mb-2 text-center">
                            <small className="text-danger" style={{ fontSize: "10px" }}>
                                {message}
                            </small>
                        </div>
                    )}

                    <div className="mb-3">
                        <button onClick={handleSubmit} className="btn btn-primary w-100">
                            Continue
                        </button>
                    </div>

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

export default LoginPage;
