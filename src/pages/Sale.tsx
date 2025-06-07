import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

import SaleForm from "@/components/shared/Sale";


export default function Sale() {
    const meta = metaData["/venda"];
    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <div className="flex items-center justify-center">
                <SaleForm />
            </div>
        </>
    )
}