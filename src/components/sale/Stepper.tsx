"use client"

import type React from "react"
import { Check, User, Package, Wrench, ClipboardList, CheckCircle } from "lucide-react"

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
                return <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            case 1:
                return <Package className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            case 2:
                return <Wrench className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            case 3:
                return <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            case 4:
                return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            default:
                return <span className="text-xs sm:text-sm lg:text-base font-semibold">{index + 1}</span>
        }
    }

    return (
        <div className="w-full mb-4 sm:mb-6 lg:mb-8 px-1 sm:px-2 lg:px-4">
            {/* Desktop/Tablet Horizontal Stepper */}
            <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep
                        const isCurrent = index === currentStep
                        const isClickable = onStepClick && index <= currentStep

                        return (
                            <div key={index} className="flex items-center flex-1 relative">
                                <div className="flex flex-col items-center w-full">
                                    <button
                                        onClick={isClickable ? () => onStepClick(index) : undefined}
                                        disabled={!isClickable}
                                        className={`
                      w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 
                      rounded-full flex items-center justify-center 
                      text-sm md:text-base lg:text-lg font-medium 
                      transition-all duration-300 ease-in-out
                      border-2 
                      ${isCompleted
                                                ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                                                : isCurrent
                                                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-600 shadow-xl ring-4 ring-red-200 scale-105 animate-pulse"
                                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                                            }
                      ${isClickable ? "cursor-pointer" : "cursor-default"}
                      focus:outline-none focus:ring-4 focus:ring-offset-2 
                      ${isCurrent ? "focus:ring-red-300" : "focus:ring-blue-300"}
                    `}
                                        aria-label={`${isCompleted ? "Concluído" : isCurrent ? "Atual" : "Pendente"}: Etapa ${index + 1} - ${step}`}
                                        aria-current={isCurrent ? "step" : undefined}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" /> : getStepIcon(index)}
                                    </button>

                                    <span
                                        className={`
                      mt-2 md:mt-3 lg:mt-4 
                      text-xs md:text-sm lg:text-base 
                      text-center 
                      max-w-20 md:max-w-24 lg:max-w-32 
                      leading-tight font-medium
                      transition-all duration-300
                      px-1
                      ${isCompleted
                                                ? "text-green-700 font-semibold"
                                                : isCurrent
                                                    ? "text-red-700 font-bold"
                                                    : "text-gray-500"
                                            }
                    `}
                                    >
                                        {step}
                                    </span>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 relative h-1 mx-2 md:mx-3 lg:mx-4 mt-5 md:mt-6 lg:mt-7">
                                        <div className="absolute top-0 left-0 h-full w-full bg-gray-300 rounded-full"></div>
                                        <div
                                            className={`
                        absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full
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

            {/* Mobile Vertical Stepper */}
            <div className="sm:hidden">
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep
                        const isCurrent = index === currentStep
                        const isClickable = onStepClick && index <= currentStep

                        return (
                            <div key={index} className="flex items-start space-x-3">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={isClickable ? () => onStepClick(index) : undefined}
                                        disabled={!isClickable}
                                        className={`
                      w-8 h-8 rounded-full flex items-center justify-center 
                      text-xs font-medium transition-all duration-300
                      border-2 flex-shrink-0
                      ${isCompleted
                                                ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-md"
                                                : isCurrent
                                                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-600 shadow-lg ring-2 ring-red-200"
                                                    : "bg-white text-gray-600 border-gray-300 shadow-sm"
                                            }
                      ${isClickable ? "cursor-pointer" : "cursor-default"}
                      focus:outline-none focus:ring-2 focus:ring-offset-1
                      ${isCurrent ? "focus:ring-red-300" : "focus:ring-blue-300"}
                    `}
                                        aria-label={`${isCompleted ? "Concluído" : isCurrent ? "Atual" : "Pendente"}: Etapa ${index + 1} - ${step}`}
                                    >
                                        {isCompleted ? <Check className="w-4 h-4" /> : getStepIcon(index)}
                                    </button>

                                    {/* Vertical Connector */}
                                    {index < steps.length - 1 && (
                                        <div className="w-0.5 h-8 mt-2 relative">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gray-300"></div>
                                            <div
                                                className={`
                          absolute top-0 left-0 w-full bg-gradient-to-b from-green-500 to-green-400
                          transition-all duration-500 ease-in-out
                        `}
                                                style={{ height: index < currentStep ? "100%" : "0%" }}
                                            ></div>
                                        </div>
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 min-w-0 pb-4">
                                    <div
                                        className={`
                      text-sm font-medium leading-tight
                      transition-all duration-300
                      ${isCompleted
                                                ? "text-green-700 font-semibold"
                                                : isCurrent
                                                    ? "text-red-700 font-bold"
                                                    : "text-gray-500"
                                            }
                    `}
                                    >
                                        {step}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {isCompleted ? "Concluído" : isCurrent ? "Em andamento" : "Pendente"}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Mobile Progress Bar */}
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-700 ease-in-out"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {/* Mobile Progress Text */}
                <div className="mt-2 text-center">
                    <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                        Etapa {currentStep + 1} de {steps.length}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Stepper
