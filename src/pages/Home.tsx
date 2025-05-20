import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Home() {
    const meta = metaData["/"];
    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <div>
                <h1>Home</h1>
                <p>Welcome to the home page!</p>
            </div>
        </>
    );
}