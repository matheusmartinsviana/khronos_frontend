import type React from "react"
import type { NotificationState } from "@/types"

interface NotificationProps {
    notification: NotificationState
    onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
    if (!notification.show) return null

    const getBackgroundColor = () => {
        switch (notification.type) {
            case "success":
                return "#d4edda"
            case "error":
                return "#f8d7da"
            case "info":
                return "#d1ecf1"
            default:
                return "#d1ecf1"
        }
    }

    const getBorderColor = () => {
        switch (notification.type) {
            case "success":
                return "#c3e6cb"
            case "error":
                return "#f5c6cb"
            case "info":
                return "#bee5eb"
            default:
                return "#bee5eb"
        }
    }

    const getTextColor = () => {
        switch (notification.type) {
            case "success":
                return "#155724"
            case "error":
                return "#721c24"
            case "info":
                return "#0c5460"
            default:
                return "#0c5460"
        }
    }

    const getIcon = () => {
        switch (notification.type) {
            case "success":
                return "✓"
            case "error":
                return "✕"
            case "info":
                return "ℹ"
            default:
                return "ℹ"
        }
    }

    const notificationStyle: React.CSSProperties = {
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        borderRadius: "4px",
        padding: "0.75rem",
        color: getTextColor(),
        zIndex: 1000,
        minWidth: "250px",
        maxWidth: "400px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "slideIn 0.3s ease-out",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    }

    const closeButtonStyle: React.CSSProperties = {
        background: "none",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
        color: getTextColor(),
        marginLeft: "auto",
        padding: "0",
        width: "16px",
        height: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }

    return (
        <>
            <style>
                {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
            </style>
            <div data-testid="notification" style={notificationStyle} >
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>{getIcon()}</span>
                <span style={{ flex: 1, fontSize: "14px" }}>{notification.message}</span>
                <button onClick={onClose} style={closeButtonStyle}>
                    ×
                </button>
            </div>
        </>
    )
}

export default Notification
