-- drizzle/migration_002_schema_improvements.sql
-- Αυτό το αρχείο μετανάστευσης περιλαμβάνει όλες τις βελτιώσεις που προτείνουμε για το schema

-- Διόρθωση των συσχετίσεων που θέλουμε να αλλάξουμε τη συμπεριφορά διαγραφής
-- Η σύνταξη για το ALTER TABLE πρέπει να είναι προσεκτική - διαχωρίζουμε τις εντολές

-- 1. Αλλαγή του contact_messages.responded_by_id σε SET NULL
ALTER TABLE "contact_messages" DROP CONSTRAINT IF EXISTS "contact_messages_responded_by_id_users_id_fk"; -- Διαγραφή παλιού constraint
--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_responded_by_id_users_id_fk" 
FOREIGN KEY ("responded_by_id") REFERENCES "public"."users"("id") 
ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint

-- Προσθήκη column status στον blog_posts αν δεν υπάρχει ήδη
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'draft' NOT NULL;
--> statement-breakpoint

-- Ενημέρωση του status με βάση την τιμή του published
UPDATE "blog_posts" SET "status" = CASE 
  WHEN "published" = true THEN 'published' 
  ELSE 'draft' 
END;
--> statement-breakpoint

-- Προσθήκη επιπλέον indexes για βελτιστοποίηση απόδοσης

-- Indexes για τον πίνακα blog_posts
CREATE INDEX IF NOT EXISTS "blog_posts_status_idx" ON "blog_posts" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_date_idx" ON "blog_posts" ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_author_name_idx" ON "blog_posts" ("author_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_published_featured_idx" ON "blog_posts" ("published", "featured");
--> statement-breakpoint

-- Indexes για τον πίνακα certifications
CREATE INDEX IF NOT EXISTS "certifications_type_idx" ON "certifications" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_featured_idx" ON "certifications" ("featured");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_issuer_idx" ON "certifications" ("issuer");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_issue_date_idx" ON "certifications" ("issue_date");
--> statement-breakpoint

-- Indexes για τον πίνακα skills
CREATE INDEX IF NOT EXISTS "skills_category_idx" ON "skills" ("category");
--> statement-breakpoint

-- Indexes για τον πίνακα projects
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_featured_order_idx" ON "projects" ("featured", "order");
--> statement-breakpoint

-- Indexes για τους πίνακες συσχετίσεων
CREATE INDEX IF NOT EXISTS "blog_posts_to_categories_post_idx" ON "blog_posts_to_categories" ("post_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_to_categories_category_idx" ON "blog_posts_to_categories" ("category_id");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "certifications_to_skills_certification_idx" ON "certifications_to_skills" ("certification_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_to_skills_skill_idx" ON "certifications_to_skills" ("skill_id");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "projects_to_categories_project_idx" ON "projects_to_categories" ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_to_categories_category_idx" ON "projects_to_categories" ("category_id");
--> statement-breakpoint

-- Δημιουργία πίνακα blog_tags αν δεν υπάρχει
CREATE TABLE IF NOT EXISTS "blog_tags" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(50) NOT NULL,
  "slug" varchar(50) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "blog_tags_name_unique" UNIQUE("name"),
  CONSTRAINT "blog_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint

-- Δημιουργία index για το slug στον πίνακα blog_tags
CREATE INDEX IF NOT EXISTS "blog_tags_slug_idx" ON "blog_tags" ("slug");
--> statement-breakpoint

-- Δημιουργία πίνακα blog_posts_tags αν δεν υπάρχει
CREATE TABLE IF NOT EXISTS "blog_posts_tags" (
  "post_id" integer NOT NULL,
  "tag_id" integer NOT NULL,
  CONSTRAINT "blog_posts_tags_post_id_tag_id_pk" PRIMARY KEY("post_id", "tag_id"),
  CONSTRAINT "blog_posts_tags_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "blog_posts_tags_tag_id_blog_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint

-- Δημιουργία indexes για τον πίνακα blog_posts_tags
CREATE INDEX IF NOT EXISTS "blog_posts_tags_post_idx" ON "blog_posts_tags" ("post_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_tags_tag_idx" ON "blog_posts_tags" ("tag_id");
--> statement-breakpoint

-- Υπόλοιπες εντολές ακολουθούν την ίδια μορφή...