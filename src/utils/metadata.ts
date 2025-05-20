import { BASE_URL } from "./constants";

const metaData = {
    "/": {
        title: "Início - Khronos",
        description: "Bem-vindo ao Khronos, sua plataforma de gestão e vendas.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Khronos",
            url: `${BASE_URL}/`,
        },
    },
    "/dashboard": {
        title: "Dashboard - Khronos",
        description: "Acompanhe suas métricas, desempenho e relatórios em tempo real.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/dashboard`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Dashboard",
            url: `${BASE_URL}/dashboard`,
        },
    },
    "/login": {
        title: "Login - Khronos",
        description: "Acesse sua conta na plataforma Khronos.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/login`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Login",
            url: `${BASE_URL}/login`,
        },
    },
    "/venda": {
        title: "Vendas - Khronos",
        description: "Gerencie e registre suas vendas com agilidade e segurança.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/venda`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Gestão de Vendas",
            url: `${BASE_URL}/venda`,
        },
    },
    "/clientes": {
        title: "Clientes - Khronos",
        description: "Visualize e gerencie sua base de clientes com facilidade.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/clientes`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Gestão de Clientes",
            url: `${BASE_URL}/clientes`,
        },
    },
    "/servicos": {
        title: "Serviços - Khronos",
        description: "Cadastre e organize os serviços oferecidos pelo seu negócio.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/servicos`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Gestão de Serviços",
            url: `${BASE_URL}/servicos`,
        },
    },
    "/produtos": {
        title: "Produtos - Khronos",
        description: "Controle seu estoque e gerencie seus produtos com praticidade.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/produtos`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Gestão de Produtos",
            url: `${BASE_URL}/produtos`,
        },
    },
    "/configuracoes": {
        title: "Configurações - Khronos",
        description: "Personalize e configure sua plataforma Khronos de acordo com suas necessidades.",
        image: `${BASE_URL}/images/logo.png`,
        canonical: `${BASE_URL}/configuracoes`,
        schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Configurações",
            url: `${BASE_URL}/configuracoes`,
        },
    },
};

export default metaData;
