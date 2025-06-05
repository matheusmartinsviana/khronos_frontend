import ProductForm from "@/components/shared/Products";
import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";

export default function Products() {
    const meta = metaData["/produtos"];
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
                <ProductForm />
            </div>

        </>
    )
}