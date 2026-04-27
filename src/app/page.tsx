import { redirect } from "next/navigation";
import { lunchPaths } from "@/data/lunch";

export default function HomePage() {
  redirect(lunchPaths.home);
}
