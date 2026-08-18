import Link from "next/link";
import { siteRoutes } from "@/app/_lib/site-links";

export function FormPolicyNotice({ children = "Review how this website handles submissions in the" }: { children?: string }) {
  return (
    <p className="form-legal">
      {children} <Link href={siteRoutes.privacy} target="_blank" rel="noopener noreferrer">Privacy Policy</Link> and <Link href={siteRoutes.terms} target="_blank" rel="noopener noreferrer">Terms of Service</Link>.
    </p>
  );
}
