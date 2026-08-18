import type { Metadata } from "next";
import { AttorneyIntakeForm } from "@/app/_components/AttorneyIntakeForm";
import { BrandShell } from "@/app/_components/BrandShell";

export const metadata: Metadata = {
  title: "Attorney Case Intake",
  description: "Structured intake for defense attorneys requesting investigation and criminal-defense case analysis support.",
};

export default function AttorneyIntakePage() {
  return (
    <BrandShell>
      <main className="content-section attorney-intake-page">
        <div className="content-wrap intake-layout">
          <header className="intake-intro">
            <p className="eyebrow">For defense counsel and authorized legal staff</p>
            <h1>Attorney case intake</h1>
            <p className="hero-copy">Provide the limited information needed for conflict screening, scheduling, and a preliminary scope review. A submission is a request for review—not an acceptance of the matter.</p>
            <aside className="intake-expectations">
              <h2>What happens next</h2>
              <ol>
                <li><strong>Conflict screening</strong><span>The team reviews the names and matter identifiers provided.</span></li>
                <li><strong>Scope conversation</strong><span>If the matter can be considered, the team contacts counsel to clarify objectives and timing.</span></li>
                <li><strong>Written authorization</strong><span>Work and protected document exchange begin only after scope and written terms are confirmed.</span></li>
              </ol>
            </aside>
          </header>
          <AttorneyIntakeForm />
        </div>
      </main>
    </BrandShell>
  );
}
