"use client"

import React from "react"
import { Check, User, Package, Wrench, ClipboardList, CheckCircle } from 'lucide-react'

interface StepperProps {
    currentStep: number
    steps: string[]
    onStepClick?: (stepIndex: number) => void
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, onStepClick }) => {
    // Ícones personalizados para cada etapa
    const getStepIcon = (index: number) => {
        switch (index) {
            case 0:
                return <User className="w-4 h-4 lg:w-5 lg:h-5" />
            case 1:
                return <Package className="w-4 h-4 lg:w-5 lg:h-5" />
            case 2:
                return <Wrench className="w-4 h-4 lg:w-5 lg:h-5" />
            case 3:
                return <ClipboardList className="w-4 h-4 lg:w-5 lg:h-5" />
            case 4:
                return <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            default:
                return <span>{index + 1}</span>
        }
    }

    return (
        <div className="w-full mb-8 px-2">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    const isClickable = onStepClick && index <= currentStep

                    return (
                        <div key={index} className="flex items-center flex-1 relative">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={isClickable ? () => onStepClick(index) : undefined}
                                    disabled={!isClickable}
                                    className={`
                    w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center 
                    text-sm lg:text-base font-medium transition-all duration-300 
                    ${isCompleted
                                            ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1"
                                            : isCurrent
                                                ? "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg ring-4 ring-red-200 scale-110"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }
                    ${isClickable ? "cursor-pointer" : "cursor-default"}
                  `}
                                    aria-label={`Ir para etapa ${index + 1}: ${step}`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 lg:w-6 lg:h-6" />
                                    ) : (
                                        getStepIcon(index)
                                    )}
                                </button>
                                <span
                                    className={`
                    mt-3 text-xs lg:text-sm text-center max-w-24 lg:max-w-32 leading-tight font-medium
                    transition-all duration-300
                    ${isCompleted
                                            ? "text-green-700"
                                            : isCurrent
                                                ? "text-red-700"
                                                : "text-gray-500"
                                        }
                  `}
                                >
                                    {step}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 relative h-0.5 mx-2 lg:mx-4">
                                    <div
                                        className={`
                      absolute top-0 left-0 h-full w-full bg-gray-300
                      transition-all duration-500 ease-in-out
                    `}
                                    ></div>
                                    <div
                                        className={`
                      absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400
                      transition-all duration-700 ease-in-out
                    `}
                                        style={{ width: index < currentStep ? "100%" : "0%" }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Stepper
