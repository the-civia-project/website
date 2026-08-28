CREATE TABLE `email_addresses` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text(36) NOT NULL,
	`email` text NOT NULL,
	`validation_code_hash` text NOT NULL,
	`validated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_addresses_uuid_unique` ON `email_addresses` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_addresses_email_unique` ON `email_addresses` (`email`);--> statement-breakpoint
CREATE TABLE `newsletter_processed_emails` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text(36) NOT NULL,
	`newsletter_uuid` text NOT NULL,
	`email` text NOT NULL,
	`request_id` text NOT NULL,
	`processed_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_processed_emails_uuid_unique` ON `newsletter_processed_emails` (`uuid`);--> statement-breakpoint
CREATE TABLE `newsletters` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text(36) NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`text` text NOT NULL,
	`body` text NOT NULL,
	`started_send_at` text DEFAULT (current_timestamp) NOT NULL,
	`finished_send_at` text,
	`finished` integer DEFAULT 0,
	`total` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletters_uuid_unique` ON `newsletters` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `newsletters_name_unique` ON `newsletters` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `newsletters_subject_unique` ON `newsletters` (`subject`);