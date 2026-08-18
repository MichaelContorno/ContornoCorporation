CREATE TABLE `app_schema_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `app_schema_state` (`id`, `version`, `updated_at`) VALUES (1, 4, 0);--> statement-breakpoint
ALTER TABLE `subscribers` ADD `confirmation_token_hash` text;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `confirmation_expires_at` integer;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `verified_at` integer;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `verification_method` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subscribers_confirmation_token` ON `subscribers` (`confirmation_token_hash`);--> statement-breakpoint
CREATE INDEX `idx_subscribers_status_updated_at` ON `subscribers` (`status`,`updated_at`);
