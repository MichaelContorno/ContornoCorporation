import type { Metadata } from "next";
import { BrandShell } from "@/app/_components/BrandShell";
import { ConfirmationClient } from "./ConfirmationClient";

export const metadata: Metadata = {
  title: "Confirm Email Updates",
  description: "Confirm a request to receive email updates from The Contorno Corporation.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ConfirmUpdatesPage() {
  return (
    <BrandShell>
      <main className="legal-page">
        <div className="content-wrap narrow">
          <p className="eyebrow">Email updates</p>
          <h1>Confirm your email</h1>
          <p>For your protection, opening this page does not subscribe you. Confirmation requires an intentional button click.</p>
          <ConfirmationClient />
          <noscript><p className="form-notice">JavaScript is required to confirm this request.</p></noscript>
        </div>
      </main>
    </BrandShell>
  );
}
