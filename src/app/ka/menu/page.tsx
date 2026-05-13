import { EfreMenuPage } from "@/components/menu/EfreMenuPage";
import { getPublicMenu } from "@/lib/menuStore";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "მენიუ | Efre",
    description: "აღმოაჩინეთ უნიკალური გემოები ჩვენს განახლებულ მენიუში.",
};

export default async function KaMenuPage() {
    const menuData = await getPublicMenu("ka");
    return <EfreMenuPage locale="ka" menuData={menuData} />;
}
