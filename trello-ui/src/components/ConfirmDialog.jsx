import { Icon } from "@iconify/react";

const ConfirmDialog = ({ title = "Confirm", message = "Are you sure?", confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, loading = false, tone = "neutral" }) => {
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
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
                    padding: 1.25rem 1.25rem 1rem 1.25rem;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 560px;
                    margin: 1rem;
                    animation: slideUp 0.2s ease-out;
                }
                .dialog-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .dialog-icon {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 9999px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .dialog-icon.neutral {
                    background: #eff6ff;
                    color: #2563eb;
                }
                .dialog-icon.destructive {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .dialog-title {
                    font-weight: 600;
                    color: #111827;
                    font-size: 1rem;
                    line-height: 1.4;
                    margin: 0;
                }
                .dialog-message {
                    color: #6b7280;
                    font-size: 0.95rem;
                    line-height: 1.55;
                    margin-top: 4px;
                }
                .actions {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    justify-content: flex-end;
                }
                .btn {
                    border: none;
                    border-radius: 8px;
                    padding: 0.625rem 0.875rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: background 0.2s ease, transform 0.15s ease;
                }
                .btn-cancel {
                    background: #f3f4f6;
                    color: #111827;
                }
                .btn-cancel:hover {
                    background: #e5e7eb;
                    transform: translateY(-1px);
                }
                .btn-confirm.neutral {
                    background: #10b981;
                    color: #ffffff;
                }
                .btn-confirm.neutral:hover {
                    background: #059669;
                    transform: translateY(-1px);
                }
                .btn-confirm.destructive {
                    background: #ef4444;
                    color: #ffffff;
                }
                .btn-confirm.destructive:hover {
                    background: #dc2626;
                    transform: translateY(-1px);
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
                    <div className="dialog-header">
                        <div className={`dialog-icon ${tone}`}>
                            <Icon icon={tone === "destructive" ? "mdi:alert" : "mdi:information-outline"} width="20" height="20" />
                        </div>
                        <div>
                            <h3 className="dialog-title">{title}</h3>
                            <div className="dialog-message">{message}</div>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn btn-cancel" onClick={onCancel} disabled={loading}>
                            {cancelText}
                        </button>
                        <button className={`btn btn-confirm ${tone}`} onClick={onConfirm} disabled={loading}>
                            {loading ? (
                                <>
                                    <Icon icon="mdi:loading" width="18" height="18" className="loading-spinner" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Icon icon={tone === "destructive" ? "mdi:delete" : "mdi:check-circle"} width="18" height="18" />
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
