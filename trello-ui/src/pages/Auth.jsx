import React from "react";
import { leftImage, rightImage } from "../assets/global/index";
import API_BASE_URL from "../../config/index";

const AuthPage = () => {
    return (
        <div className="bg-light position-relative d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <img src={leftImage} alt="Left" className="position-absolute d-none d-md-block" style={{ bottom: 0, left: 0, width: "25%" }} />
            <img src={rightImage} alt="Right" className="position-absolute d-none d-md-block" style={{ bottom: 0, right: 0, width: "25%" }} />

            <div className="col-md-4 col-10">
                <div className="border rounded p-4 shadow-sm bg-white">
                    <h3 className="mb-3 mt-4 text-center">Email Verification</h3>
                    <p className="text-center m-0 pb-2">Please enter your code that send to your email address</p>
                    <input type="code" className="form-control mb-3 text-center" placeholder="Enter code verification" />
                    <button className="btn btn-primary w-100 mb-3">Submit</button>
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

export default AuthPage;
