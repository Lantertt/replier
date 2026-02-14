CREATE TABLE "prompt_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_ig_user_id" text NOT NULL,
	"prompt_template_id" uuid NOT NULL,
	"granted_by_admin_clerk_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"product_name" text NOT NULL,
	"prompt_body" text NOT NULL,
	"updated_by_admin_clerk_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_prompt_assignments_target_ig_user_id" ON "prompt_assignments" USING btree ("target_ig_user_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_assignments_prompt_template_id" ON "prompt_assignments" USING btree ("prompt_template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_prompt_assignments_target_prompt" ON "prompt_assignments" USING btree ("target_ig_user_id","prompt_template_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_product_name" ON "prompt_templates" USING btree ("product_name");