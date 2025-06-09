import React from "react"

interface StepperProps {
    currentStep: number
    steps: string[]
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    const stepperStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        marginBottom: "1.5rem",
        padding: "1rem",
        backgroundColor: "white",
    }

    const stepStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        width: "100%",
    }

    const stepNumberStyle = (isActive: boolean, isCompleted: boolean): React.CSSProperties => ({
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "bold",
        marginRight: "8px",
        backgroundColor: isCompleted ? "#28a745" : isActive ? "#a31c1e" : "#e9ecef",
        color: isCompleted || isActive ? "white" : "#6c757d",
        transition: "all 0.3s ease",
    })

    const stepLabelStyle = (isActive: boolean): React.CSSProperties => ({
        fontSize: "14px",
        fontWeight: isActive ? "600" : "normal",
        color: isActive ? "#a31c1e" : "#6c757d",
        transition: "all 0.3s ease",
    })

    const lineStyle = (isCompleted: boolean): React.CSSProperties => ({
        flex: 1,
        height: "2px",
        backgroundColor: isCompleted ? "#28a745" : "#e9ecef",
        margin: "0 0.5rem",
        transition: "all 0.3s ease",
    })

    return (
        <div style={stepperStyle}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div style={stepStyle}>
                        <div style={stepNumberStyle(index === currentStep, index < currentStep)}>{index + 1}</div>
                        <span style={stepLabelStyle(index === currentStep)}>{step}</span>
                    </div>
                    {index < steps.length - 1 && <div style={lineStyle(index < currentStep)} />}
                </React.Fragment>
            ))}
        </div>
    )
}

export default Stepper
