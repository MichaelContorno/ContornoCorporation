import type { Metadata } from "next";
import { HomeExperience } from "./_components/HomeExperience";

export const metadata: Metadata = {
  title: { absolute: "The Contorno Corporation" },
  description:
    "Excellence in investigation. Integrity in defense. Results that matter.",
};

export default function Home() {
  return <HomeExperience />;
}
