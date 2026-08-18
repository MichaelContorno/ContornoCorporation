CREATE TABLE `attorney_intakes` (
	`id` text PRIMARY KEY NOT NULL,
	`reference_code` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`attorney_first_name` text NOT NULL,
	`attorney_last_name` text NOT NULL,
	`firm_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`submitter_role` text NOT NULL,
	`preferred_contact` text NOT NULL,
	`time_zone` text NOT NULL,
	`best_contact_time` text DEFAULT '' NOT NULL,
	`bar_jurisdiction` text NOT NULL,
	`bar_number` text DEFAULT '' NOT NULL,
	`client_name` text NOT NULL,
	`known_aliases` text DEFAULT '' NOT NULL,
	`matter_caption` text NOT NULL,
	`case_number` text DEFAULT '' NOT NULL,
	`court_jurisdiction` text NOT NULL,
	`prosecuting_agency` text DEFAULT '' NOT NULL,
	`related_parties` text DEFAULT '' NOT NULL,
	`custody_status` text NOT NULL,
	`urgency` text NOT NULL,
	`critical_date_type` text DEFAULT '' NOT NULL,
	`critical_date` text DEFAULT '' NOT NULL,
	`services_requested` text NOT NULL,
	`investigative_objective` text NOT NULL,
	`consent_version` text NOT NULL,
	`source` text DEFAULT 'attorney-intake' NOT NULL,
	`client_hash` text NOT NULL,
	`retention_review_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attorney_intakes_reference_code` ON `attorney_intakes` (`reference_code`);--> statement-breakpoint
CREATE INDEX `idx_attorney_intakes_created_at` ON `attorney_intakes` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_attorney_intakes_status_created_at` ON `attorney_intakes` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_attorney_intakes_critical_date` ON `attorney_intakes` (`critical_date`);--> statement-breakpoint
CREATE INDEX `idx_attorney_intakes_client_created_at` ON `attorney_intakes` (`client_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_attorney_intakes_email_created_at` ON `attorney_intakes` (`email`,`created_at`);--> statement-breakpoint
CREATE TABLE `document_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`document_id` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_document_audit_document_created` ON `document_audit_events` (`document_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`intake_id` text,
	`source` text NOT NULL,
	`uploaded_by_user_id` text NOT NULL,
	`uploaded_by_email` text NOT NULL,
	`display_name` text NOT NULL,
	`storage_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`sha256` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_documents_storage_key` ON `documents` (`storage_key`);--> statement-breakpoint
CREATE INDEX `idx_documents_created_at` ON `documents` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_documents_status_created_at` ON `documents` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_documents_intake_id` ON `documents` (`intake_id`);