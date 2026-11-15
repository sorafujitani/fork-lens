import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const repositories = sqliteTable('repositories', {
  id: integer('id').primaryKey(),
  fullName: text('full_name').notNull().unique(),
});
