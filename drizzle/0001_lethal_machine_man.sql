CREATE TYPE "public"."certificate_type" AS ENUM('course', 'certification', 'degree', 'award', 'other'); -- Τύποι πιστοποιητικών
--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'inactive', 'archived', 'featured', 'completed', 'in-progress'); -- Καταστάσεις έργων
--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('new', 'pending', 'processing', 'completed', 'failed', 'canceled'); -- Γενικές καταστάσεις