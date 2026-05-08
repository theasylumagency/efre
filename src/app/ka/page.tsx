import { EfreHomepage, efreHomeMetadata } from "@/components/home/EfreHomepage";

export const dynamic = "force-dynamic";
export const metadata = efreHomeMetadata;

export default function KaHomePage() {
  return <EfreHomepage />;
}
