import { EfreMenuPage } from "@/components/menu/EfreMenuPage";
import { getPublicMenu } from "@/lib/menuStore";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Menu | Efre",
    description: "Discover unique flavors in our curated menu.",
};

export default async function EnMenuPage() {
    const menuData = await getPublicMenu("en");
    return <EfreMenuPage locale="en" menuData={menuData} />;
}
