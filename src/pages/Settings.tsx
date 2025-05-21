import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Settings() {
    const meta = metaData["/configuracoes"];
    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <p>Settings</p>
        </>
    )
}