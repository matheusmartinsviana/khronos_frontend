import Seo from "@/lib/Seo";

export default function Home() {
    return (
        <>
            <Seo
                title="Home - Khronos"
                description="SFA Khronos Home Page"
                image="http:/localhost:3000/open-graph-image.jpg"
                canonical="http://yourdomain.com/"
                schemaMarkup={{
                    '@context': 'http://https:/localhost:3000',
                    '@type': 'WebSite',
                    name: 'Khronos Home',
                    url: 'http://https:/localhost:3000/',
                }}
            />
            <div>
                <h1>Home</h1>
                <p>Welcome to the home page!</p>
            </div>
        </>
    );
}