import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Button } from "./index";

const CreateModal = ({
    onSubmit,
    onClose,
    title = "Create New Board",
    nameLabel = "Board Name",
    namePlaceholder = "Enter board name...",
    descriptionLabel = "Description",
    submitLabel = "Create Board",
    initialValues = { name: "", description: "" },
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setFocus,
        watch,
    } = useForm({ defaultValues: initialValues });

    const [internalSubmitting, setInternalSubmitting] = useState(false);

    useEffect(() => {
        setFocus("name");
        const onEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onClose, setFocus]);

    const handleFormSubmit = async (data) => {
        setInternalSubmitting(true);
        try {
            await onSubmit(data);
            reset();
        } finally {
            setInternalSubmitting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(handleFormSubmit)();
        }
    };

    const watchedName = watch("name", "");

    const submitting = isSubmitting || internalSubmitting;

    return (
        <>
            <style jsx>{`
                .backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease-out;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(241, 245, 249, 0.3);
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes pulse-custom {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.1;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 0.15;
                    }
                }
                .create-modal {
                    position: relative;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    padding: 2rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 600px;
                    margin: 1rem;
                    animation: slideUp 0.3s ease-out;
                    overflow: hidden;
                    max-height: 90vh;
                    overflow-y: auto;
                    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(241, 245, 249, 0.3);
                    scrollbar-width: thin;
                }
                .create-modal::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 50%, rgba(4, 120, 87, 0.1) 100%);
                    animation: pulse-custom 4s ease-in-out infinite;
                    z-index: -1;
                }

                /* Custom Scrollbar Styles - giống CardDetail */
                .create-modal::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .create-modal::-webkit-scrollbar-track {
                    background: rgba(241, 245, 249, 0.3);
                    border-radius: 10px;
                }

                .create-modal::-webkit-scrollbar-thumb {
                    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(241, 245, 249, 0.3);
                    scrollbar-width: thin;
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                    transition: all 0.3s ease;
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: none;
                    border-radius: 12px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #ef4444;
                }
                .close-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    transform: scale(1.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .title-gradient {
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    font-size: 1.75rem;
                }
                .subtitle {
                    color: #6b7280;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    margin: 0;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.875rem;
                }
                .label-icon {
                    color: #6b7280;
                    flex-shrink: 0;
                }
                .form-input,
                .form-textarea {
                    background: rgba(249, 250, 251, 0.8);
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    width: 100%;
                    color: #374151;
                    box-sizing: border-box;
                }
                .form-input:focus,
                .form-textarea:focus {
                    border-color: #10b981;
                    background: #fff;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }
                .form-input:hover:not(:focus),
                .form-textarea:hover:not(:focus) {
                    border-color: #d1d5db;
                }
                .form-textarea {
                    resize: vertical;
                    min-height: 120px;
                    font-family: inherit;
                }
                .error {
                    display: block;
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    color: #dc2626;
                }
                .actions {
                    margin-top: 1rem;
                }
                .create-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border: none;
                    border-radius: 16px;
                    padding: 0.875rem 2rem;
                    font-weight: 600;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .create-btn:not(:disabled):hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.4);
                    transform: translateY(-2px) scale(1.02);
                }
                .create-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
                }
            `}</style>

            <div className="backdrop" onClick={onClose} role="dialog" aria-modal="true">
                <form className="create-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit(handleFormSubmit)}>
                    <button className="close-btn" type="button" onClick={onClose} aria-label="Close modal">
                        <Icon icon="mdi:close" width="20" height="20" />
                    </button>

                    <div className="header">
                        <h2 className="title-gradient">{title}</h2>
                        <p className="subtitle">Set up essential information below</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="board-name">
                            <Icon icon="mdi:pencil-outline" width="22" height="22" className="label-icon" />
                            {nameLabel}
                        </label>
                        <input
                            id="board-name"
                            type="text"
                            className="form-input"
                            placeholder={namePlaceholder}
                            {...register("name", { required: true, minLength: 2 })}
                            onKeyPress={handleKeyPress}
                            aria-invalid={!!errors.name}
                            autoFocus
                        />
                        {errors.name && <span className="error">{nameLabel} is required (min 2 characters)</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="board-description">
                            <Icon icon="mdi:file-document-outline" width="22" height="22" className="label-icon" />
                            {descriptionLabel} <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
                        </label>
                        <textarea id="board-description" className="form-textarea" placeholder={`Describe the ${descriptionLabel.toLowerCase()}...`} {...register("description")} />
                    </div>

                    <div className="actions">
                        <Button type="submit" style={{ width: "100%" }} name={submitLabel} icon="mdi:plus" variant="primary" iconSize={18} size="md" disabled={!watchedName?.trim() || submitting} />
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateModal;
