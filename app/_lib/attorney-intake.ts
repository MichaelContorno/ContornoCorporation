export const attorneyServiceOptions = [
  ["case-file-analysis", "Case-file analysis"],
  ["witness-location", "Witness location"],
  ["witness-interviews", "Witness interviews"],
  ["scene-timeline", "Scene and timeline work"],
  ["records-research", "Records research"],
  ["evidence-organization", "Evidence organization"],
  ["other", "Other investigative support"],
] as const;

export const submitterRoles = new Set(["attorney", "paralegal", "public-defender", "other"]);
export const preferredContacts = new Set(["email", "phone"]);
export const custodyStatuses = new Set(["detained", "released", "unknown"]);
export const urgencyOptions = new Set(["two-business-days", "one-week", "two-four-weeks", "planning"]);
export const allowedAttorneyServices: Set<string> = new Set(attorneyServiceOptions.map(([value]) => value));

export const attorneyServiceLabels = Object.fromEntries(attorneyServiceOptions) as Record<string, string>;

export const intakeStatuses = new Set([
  "new",
  "reviewing",
  "conflict-hold",
  "awaiting-counsel",
  "accepted",
  "declined",
  "closed",
]);
