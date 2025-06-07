import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";
import SignInUpForm from "./SignInUpForm";


export default function Login() {
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
      <SignInUpForm />
    </>
  );
}
