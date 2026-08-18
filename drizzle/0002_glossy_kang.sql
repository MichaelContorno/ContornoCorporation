ALTER TABLE `leads` ADD `consent_version` text DEFAULT 'legacy-pre-consent-record' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `consented_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_leads_client_created_at` ON `leads` (`client_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_leads_email_created_at` ON `leads` (`email`,`created_at`);--> statement-breakpoint
ALTER TABLE `subscribers` ADD `updated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `consent_version` text DEFAULT 'legacy-pre-consent-record' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `consented_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `source` text DEFAULT 'website-updates' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `client_hash` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `unsubscribed_at` integer;--> statement-breakpoint
CREATE INDEX `idx_subscribers_client_updated_at` ON `subscribers` (`client_hash`,`updated_at`);
