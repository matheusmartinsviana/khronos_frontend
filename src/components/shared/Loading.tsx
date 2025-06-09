import logo from '/logo.webp';

export function LoadingWithLogo() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <img
                src={logo}
                alt="Logo da Empresa"
                className="w-32 mb-6 animate-fade"
            />
            <p className="mt-4 text-gray-700 text-lg font-poppins animate-fade">Carregando...</p>
            <style>
                {`
                @keyframes fade {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                .animate-fade {
                    animation: fade 1.5s infinite;
                }
                `}
            </style>
        </div>
    );
}
