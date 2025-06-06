import ServiceForm from "@/components/shared/Services";
import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Services() {
    const meta = metaData["/servicos"];
    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <div className="flex items-center justify-center w-full">
                <ServiceForm />
            </div>
        </>
    )
}