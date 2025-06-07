import CustomerForm from "@/components/shared/AddCustomer";
import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function AddCustomer() {
    const meta = metaData["/clientes/add"];
    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <div className="flex items-start justify-center overflow-auto">
                <CustomerForm />
            </div>
        </>
    )
}