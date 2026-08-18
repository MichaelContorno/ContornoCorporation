export const SITE_ORIGIN = "https://contornocorporation.com";

export const siteRoutes = {
  home: "/",
  about: "/about",
  attorneyIntake: "/attorney-intake",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy",
  investigations: "/services/investigations",
  bailBonds: "/services/bail-bonds",
  communityManagement: "/services/community-management",
  terms: "/terms",
} as const;

export const companyLinks = [
  { href: siteRoutes.home, label: "Home" },
  { href: siteRoutes.about, label: "About Us" },
  { href: siteRoutes.faq, label: "Q&A" },
  { href: siteRoutes.contact, label: "Contact" },
] as const;

export const serviceLinks = [
  { href: siteRoutes.investigations, label: "Investigations" },
  { href: siteRoutes.attorneyIntake, label: "Attorney Case Intake" },
  { href: siteRoutes.bailBonds, label: "Bail Bonds" },
  { href: siteRoutes.communityManagement, label: "Community Association Management" },
] as const;

export const policyLinks = [
  { href: siteRoutes.privacy, label: "Privacy" },
  { href: siteRoutes.terms, label: "Terms" },
] as const;

export const publicSitePaths = [
  siteRoutes.home,
  siteRoutes.about,
  siteRoutes.attorneyIntake,
  siteRoutes.contact,
  siteRoutes.faq,
  siteRoutes.privacy,
  siteRoutes.investigations,
  siteRoutes.bailBonds,
  siteRoutes.communityManagement,
  siteRoutes.terms,
] as const;
