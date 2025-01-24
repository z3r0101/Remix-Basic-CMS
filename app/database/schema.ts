import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const Contact = pgTable("Contact", {
  id: serial("id").primaryKey(), // Use serial for auto-incrementing primary key
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").default(sql`NOW()`), // Use sql helper for default value
});

// User table
export const User = pgTable("User", {
  id: serial("id").primaryKey(), // Auto-incrementing primary key
  email: text("email").notNull().unique(), // Unique constraint on email
  password: text("password").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").default(sql`NOW()`), // Default value for creation timestamp
});

// Content table
export const Content = pgTable("Content", {
  id: serial("id").primaryKey(), // Auto-incrementing primary key
  title: text("title").notNull(),
  copy: text("copy").notNull(), // TEXT field suitable for large content
  image: text("image"), // Optional field
  image_position: text("image_position").default("center top"), // Default value
  created_at: timestamp("created_at").default(sql`NOW()`), // Default value for creation timestamp
});
