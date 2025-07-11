import React from "react";
import { leftImage, rightImage, logo } from "../assets/global/index";
import API_BASE_URL from "../../config/index";

const LoginPage = () => {
    return (
        <div className="bg-light position-relative d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <img src={leftImage} alt="Left" className="position-absolute d-none d-md-block" style={{ bottom: 0, left: 0, width: "25%" }} />
            <img src={rightImage} alt="Right" className="position-absolute d-none d-md-block" style={{ bottom: 0, right: 0, width: "25%" }} />

            <div className="col-md-4 col-10">
                <div className="border rounded p-4 shadow-sm bg-white">
                    <div className="mb-2 d-flex flex-column align-items-center">
                        <img src={logo} alt="Logo" className="" style={{ width: "56px", height: "56px" }} />
                    </div>
                    <h6 className="mb-3 text-center text-muted">Log in to continue</h6>
                    <input type="email" className="form-control mb-3 text-center" placeholder="Enter your email" />
                    <button className="btn btn-primary w-100 mb-3">Continue</button>
                    <small className="text-muted">
                        <p className="text-center mb-1 ">Privacy Policy</p>
                        <p className="text-center m-0">This site is protected by reCAPTCHA and the Google Privacy</p>
                        <p className="d-flex justify-content-center">
                            <a className="" href="#">
                                Policy and Terms of Service apply.
                            </a>
                        </p>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
