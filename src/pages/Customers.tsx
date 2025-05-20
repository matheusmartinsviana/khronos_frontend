import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Customers() {
    const meta = metaData["/login"];

    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <p>Customers</p>
        </>
    )
}