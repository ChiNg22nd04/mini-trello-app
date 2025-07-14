import React from "react";
import { Icon } from "@iconify/react";

const TaskDetail = ({ task, onClose }) => {
    if (!task) return null;

    return (
        <>
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }} onClick={onClose} />

            <div
                className="position-fixed top-50 start-50 translate-middle rounded shadow px-4 py-4"
                style={{
                    backgroundColor: "#1d2125",
                    width: "1000px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    zIndex: 1050,
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <Icon icon="material-symbols:keyboard-onscreen" width={22} color="white" />
                        <div>
                            <h5 className="mb-0 text-white">{task.title}</h5>
                            <small className="text-secondary">in list To do</small>
                        </div>
                    </div>
                    <button className="btn" onClick={onClose}>
                        <Icon icon="material-symbols:close" width={24} color="white" />
                    </button>
                </div>

                <div className="d-flex text-white" style={{ gap: "20px" }}>
                    <div style={{ width: "75%" }}>
                        <div className="d-flex mb-4 gap-5">
                            <div>
                                <p className="mb-1">Members</p>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-danger rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                        {task.assignedTo.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="border border-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                        <Icon icon="material-symbols:add" width={20} color="white" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="mb-1">Notifications</p>
                                <div className="px-2 py-1 border border-secondary rounded d-flex align-items-center gap-2" style={{ cursor: "pointer", width: "fit-content" }}>
                                    <Icon icon="material-symbols:eye-tracking-rounded" width={20} color="white" />
                                    <span className="text-white">Watch</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="d-flex align-items-center mb-2">
                                <Icon icon="material-symbols:description" width={20} />
                                <span className="ps-2">Description</span>
                            </p>
                            <div className="border border-secondary rounded px-3 py-2 bg-dark text-white">{task.description || "Add a more detailed description"}</div>
                        </div>

                        <div>
                            <p className="d-flex align-items-center mb-2">
                                <Icon icon="material-symbols:activity" width={20} />
                                <span className="ps-2">Activity</span>
                                <button className="btn btn-sm btn-outline-secondary ms-auto">Show details</button>
                            </p>
                            <div className="d-flex align-items-start gap-2">
                                <div className="bg-danger rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                    {task.assignedTo.charAt(0).toUpperCase()}
                                </div>
                                <input className="form-control bg-dark text-white border-secondary" placeholder="Write a comment" />
                            </div>
                        </div>
                    </div>

                    <div style={{ width: "25%" }}>
                        <div className="mb-4">
                            <p className="text-white fw-bold mb-2">Add to card</p>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                <Icon icon="material-symbols:person" width={18} className="me-2" />
                                Members
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-white fw-bold mb-2">Power-Ups</p>
                            <button className="btn btn-dark w-100 text-start mb-2 d-flex align-items-center gap-2">
                                <Icon icon="mdi:github" width={18} />
                                GitHub
                            </button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Branch</button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Commit</button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Issue</button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Pull Request...</button>
                        </div>

                        <button className="btn btn-outline-secondary w-100 text-start">
                            <Icon icon="material-symbols:archive" width={18} className="me-2" />
                            Archive
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskDetail;
