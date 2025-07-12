import React from "react";
import { useForm } from "react-hook-form";

const CreateBoardForm = ({ onSubmit, onClose }) => {
    console.log("CreateBoardForm rendered");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const handleFormSubmit = async (data) => {
        await onSubmit(data);
        reset();
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white text-dark p-4 rounded shadow" style={{ minWidth: "300px" }}>
                <h5 className="mb-3">Create New Board</h5>

                <div className="mb-3">
                    <label className="form-label">Board Name</label>
                    <input className="form-control" {...register("name", { required: true })} />
                    {errors.name && <span className="text-danger">Board name is required</span>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" {...register("description")}></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            reset();
                            onClose();
                        }}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBoardForm;
