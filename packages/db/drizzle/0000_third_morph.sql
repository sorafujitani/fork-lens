CREATE TABLE `repositories` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repositories_full_name_unique` ON `repositories` (`full_name`);