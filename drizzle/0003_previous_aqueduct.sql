PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`first_name` text NOT NULL,
	`email` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`consent_version` text NOT NULL,
	`consented_at` integer NOT NULL,
	`source` text DEFAULT 'website-updates' NOT NULL,
	`client_hash` text NOT NULL,
	`unsubscribed_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_subscribers`("id", "created_at", "updated_at", "first_name", "email", "active", "status", "consent_version", "consented_at", "source", "client_hash", "unsubscribed_at")
SELECT "id", "created_at", "updated_at", "first_name", "email", "active",
  CASE
    WHEN "unsubscribed_at" IS NOT NULL THEN 'unsubscribed'
    WHEN "active" = 1 THEN 'active'
    ELSE 'pending'
  END,
  "consent_version", "consented_at", "source", "client_hash", "unsubscribed_at"
FROM `subscribers`;--> statement-breakpoint
DROP TABLE `subscribers`;--> statement-breakpoint
ALTER TABLE `__new_subscribers` RENAME TO `subscribers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subscribers_email` ON `subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_subscribers_client_updated_at` ON `subscribers` (`client_hash`,`updated_at`);
