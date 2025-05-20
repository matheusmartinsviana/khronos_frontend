import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Dashboard() {
    const meta = metaData["/dashboard"];
    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <p>Dashboard</p>
        </>
    )
}