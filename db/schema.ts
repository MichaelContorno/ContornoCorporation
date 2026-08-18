import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  status: text("status").notNull().default("new"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  message: text("message").notNull(),
  source: text("source").notNull().default("website"),
  clientHash: text("client_hash").notNull(),
  consentVersion: text("consent_version").notNull(),
  consentedAt: integer("consented_at").notNull(),
}, (table) => [
  index("idx_leads_created_at").on(table.createdAt),
  index("idx_leads_status_created_at").on(table.status, table.createdAt),
  index("idx_leads_client_created_at").on(table.clientHash, table.createdAt),
  index("idx_leads_email_created_at").on(table.email, table.createdAt),
]);

export const subscribers = sqliteTable("subscribers", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("pending"),
  consentVersion: text("consent_version").notNull(),
  consentedAt: integer("consented_at").notNull(),
  source: text("source").notNull().default("website-updates"),
  clientHash: text("client_hash").notNull(),
  unsubscribedAt: integer("unsubscribed_at"),
  confirmationTokenHash: text("confirmation_token_hash"),
  confirmationExpiresAt: integer("confirmation_expires_at"),
  verifiedAt: integer("verified_at"),
  verificationMethod: text("verification_method").notNull().default(""),
}, (table) => [
  uniqueIndex("idx_subscribers_email").on(table.email),
  uniqueIndex("idx_subscribers_confirmation_token").on(table.confirmationTokenHash),
  index("idx_subscribers_client_updated_at").on(table.clientHash, table.updatedAt),
  index("idx_subscribers_status_updated_at").on(table.status, table.updatedAt),
]);

export const appSchemaState = sqliteTable("app_schema_state", {
  id: integer("id").primaryKey(),
  version: integer("version").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const assistantRequests = sqliteTable("assistant_requests", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  clientHash: text("client_hash").notNull(),
}, (table) => [index("idx_assistant_requests_client_created").on(table.clientHash, table.createdAt)]);

export const attorneyIntakes = sqliteTable("attorney_intakes", {
  id: text("id").primaryKey(),
  referenceCode: text("reference_code").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  status: text("status").notNull().default("new"),
  attorneyFirstName: text("attorney_first_name").notNull(),
  attorneyLastName: text("attorney_last_name").notNull(),
  firmName: text("firm_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  submitterRole: text("submitter_role").notNull(),
  preferredContact: text("preferred_contact").notNull(),
  timeZone: text("time_zone").notNull(),
  bestContactTime: text("best_contact_time").notNull().default(""),
  barJurisdiction: text("bar_jurisdiction").notNull(),
  barNumber: text("bar_number").notNull().default(""),
  clientName: text("client_name").notNull(),
  knownAliases: text("known_aliases").notNull().default(""),
  matterCaption: text("matter_caption").notNull(),
  caseNumber: text("case_number").notNull().default(""),
  courtJurisdiction: text("court_jurisdiction").notNull(),
  prosecutingAgency: text("prosecuting_agency").notNull().default(""),
  relatedParties: text("related_parties").notNull().default(""),
  custodyStatus: text("custody_status").notNull(),
  urgency: text("urgency").notNull(),
  criticalDateType: text("critical_date_type").notNull().default(""),
  criticalDate: text("critical_date").notNull().default(""),
  servicesRequested: text("services_requested").notNull(),
  investigativeObjective: text("investigative_objective").notNull(),
  consentVersion: text("consent_version").notNull(),
  source: text("source").notNull().default("attorney-intake"),
  clientHash: text("client_hash").notNull(),
  retentionReviewAt: integer("retention_review_at").notNull(),
}, (table) => [
  uniqueIndex("idx_attorney_intakes_reference_code").on(table.referenceCode),
  index("idx_attorney_intakes_created_at").on(table.createdAt),
  index("idx_attorney_intakes_status_created_at").on(table.status, table.createdAt),
  index("idx_attorney_intakes_critical_date").on(table.criticalDate),
  index("idx_attorney_intakes_client_created_at").on(table.clientHash, table.createdAt),
  index("idx_attorney_intakes_email_created_at").on(table.email, table.createdAt),
]);

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  status: text("status").notNull().default("ready"),
  intakeId: text("intake_id"),
  source: text("source").notNull(),
  uploadedByUserId: text("uploaded_by_user_id").notNull(),
  uploadedByEmail: text("uploaded_by_email").notNull(),
  displayName: text("display_name").notNull(),
  storageKey: text("storage_key").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  sha256: text("sha256").notNull(),
}, (table) => [
  uniqueIndex("idx_documents_storage_key").on(table.storageKey),
  index("idx_documents_created_at").on(table.createdAt),
  index("idx_documents_status_created_at").on(table.status, table.createdAt),
  index("idx_documents_intake_id").on(table.intakeId),
]);

export const documentAuditEvents = sqliteTable("document_audit_events", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  documentId: text("document_id").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
}, (table) => [index("idx_document_audit_document_created").on(table.documentId, table.createdAt)]);
