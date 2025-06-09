import React from "react"

interface StepperProps {
    currentStep: number
    steps: string[]
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex items-center w-full mb-4 lg:mb-6 p-3 lg:p-4 bg-white rounded-lg shadow-sm">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center flex-col flex-1 relative">
                        {/* Connection line */}
                        {index > 0 && (
                            <div
                                className={`absolute left-0 right-0 top-4 h-1 -translate-y-1/2 ${index <= currentStep ? "bg-red-600" : "bg-gray-200"
                                    }`}
                                style={{ width: "calc(100% - 2rem)", left: "-50%", zIndex: 0 }}
                            />
                        )}

                        {/* Step circle */}
                        <div
                            className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-semibold z-10 transition-all duration-300 ${index < currentStep
                                ? "bg-green-500 text-white"
                                : index === currentStep
                                    ? "bg-red-600 text-white ring-4 ring-red-100"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                        >
                            {index < currentStep ? (
                                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                index + 1
                            )}
                        </div>

                        {/* Step label */}
                        <span
                            className={`mt-1 lg:mt-2 text-xs font-medium text-center transition-colors duration-300 px-1 ${index === currentStep ? "text-red-600" : "text-gray-600"
                                }`}
                        >
                            {step}
                        </span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    )
}

export default Stepper
