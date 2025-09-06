import { Icon } from "@iconify/react";

const ConfirmDialog = ({ title = "Confirm", message = "Are you sure?", confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, loading = false }) => {
    return (
        <>
            <style jsx>{`
                .backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease-out;
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
                .dialog {
                    position: relative;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    padding: 2rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 480px;
                    margin: 1rem;
                    animation: slideUp 0.3s ease-out;
                    overflow: hidden;
                }
                .dialog::before {
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
                .title-gradient {
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .actions {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }
                .btn {
                    border: none;
                    border-radius: 16px;
                    padding: 0.875rem 1.25rem;
                    font-weight: 600;
                    font-size: 1rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-cancel {
                    background: rgba(239, 68, 68, 0.1);
                    color: #dc2626;
                }
                .btn-cancel:hover {
                    background: rgba(239, 68, 68, 0.2);
                    transform: translateY(-1px);
                }
                .btn-confirm {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
                }
                .btn-confirm:hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.4);
                }
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                .loading-spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>

            <div className="backdrop" onClick={onCancel}>
                <div className="dialog" onClick={(e) => e.stopPropagation()}>
                    <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                        <h2 className="title-gradient">{title}</h2>
                        <p style={{ color: "#6b7280", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{message}</p>
                    </div>

                    <div className="actions">
                        <button className="btn btn-cancel" onClick={onCancel} disabled={loading}>
                            <Icon icon="mdi:close" width="18" height="18" />
                            {cancelText}
                        </button>
                        <button className="btn btn-confirm" onClick={onConfirm} disabled={loading}>
                            {loading ? (
                                <>
                                    <Icon icon="mdi:loading" width="18" height="18" className="loading-spinner" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:check-circle" width="18" height="18" />
                                    {confirmText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmDialog;
