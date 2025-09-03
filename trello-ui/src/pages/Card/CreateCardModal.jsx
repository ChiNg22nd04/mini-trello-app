import React, { useState } from "react";
import { Icon } from "@iconify/react";

const CreateCardModal = ({
    onClose,
    onCreate,
    members = [],
    boardId,
    ownerId,
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const toggleMember = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        const createdAt = new Date().toISOString();
        onCreate({
            name: name.trim(),
            description: description.trim(),
            members: selectedMembers,
            boardId,
            ownerId,
            createdAt,
        });
    };

    return (
        <>
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
                onClick={onClose}
            />

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
                        <Icon
                            icon="material-symbols:keyboard-onscreen"
                            width={22}
                            color="white"
                        />
                        <div>
                            <h5 className="mb-0 text-white">Create Card</h5>
                            <small className="text-secondary">
                                New card will be added to this board
                            </small>
                        </div>
                    </div>
                    <button
                        className="btn"
                        style={{ marginRight: "-18px" }}
                        onClick={onClose}
                    >
                        <Icon
                            icon="material-symbols:close"
                            width={24}
                            color="white"
                        />
                    </button>
                </div>

                <div className="text-white">
                    <div>
                        <div className="mb-4">
                            <label className="form-label text-white">
                                Title
                            </label>
                            <input
                                className="form-control bg-dark text-white border-secondary"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Card title"
                            />
                        </div>

                        <div className="d-flex mb-4 gap-5">
                            <div>
                                <p className="mb-1">Members</p>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    {members.length === 0 && (
                                        <div className="text-secondary">
                                            No members
                                        </div>
                                    )}
                                    {members.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            className={`btn ${
                                                selectedMembers.includes(m.id)
                                                    ? "btn-primary"
                                                    : "btn-outline-secondary"
                                            } btn-sm`}
                                            onClick={() => toggleMember(m.id)}
                                        >
                                            {m.username}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="d-flex align-items-center mb-2">
                                <Icon
                                    icon="material-symbols:description"
                                    width={20}
                                />
                                <span className="ps-2">Description</span>
                            </p>
                            <textarea
                                className="form-control bg-dark text-white border-secondary"
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a more detailed description"
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={!name.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCardModal;
