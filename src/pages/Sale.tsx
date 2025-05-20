import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

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
            <p>Sale</p>
        </>
    )
}