import CustomerList from "@/components/shared/Customer";
import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Customers() {
    const meta = metaData["/clientes"];

    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <div className="flex items-start">
                <CustomerList />
            </div>
        </>
    )
}