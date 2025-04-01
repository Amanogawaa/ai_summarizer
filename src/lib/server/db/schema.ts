import { sql } from 'drizzle-orm/sql';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }).unique(),
	full_name: text('full_name').notNull(),
	email: text('email').notNull().unique(),
	hash_password: text('hash_password').notNull(),
	role: text('role', { enum: ['admin', 'moderator'] })
		.notNull()
		.default('admin'),
	created_at: integer('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const announcements = sqliteTable('announcements', {
	id: integer('id').primaryKey({ autoIncrement: true }).unique(),
	title: text('title').notNull().unique(),
	description: text('description').notNull(),
	user_id: integer('user_id').references(() => user.id),
	created_at: integer('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: integer('updated_at')
});
