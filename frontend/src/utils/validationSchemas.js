/**
 * Zod validation schemas for all forms in the application.
 *
 * Used with react-hook-form via @hookform/resolvers/zod.
 */
import { z } from "zod";

// ── Login ────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// ── Register ─────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// ── Add Company ──────────────────────────────────────────────────────────
export const addCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  sector: z.string().optional(),
  website: z
    .string()
    .url("Enter a valid URL (e.g. https://example.com)")
    .or(z.literal(""))
    .optional(),
});

// ── Add Record ───────────────────────────────────────────────────────────
export const addRecordSchema = z.object({
  company_id: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Please select a company",
    }),
  role_applied: z.string().min(1, "Role applied is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  ctc_offered: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      return Number(val);
    }),
  status: z.enum(["pending", "selected", "rejected"]),
});

// ── Add Round ────────────────────────────────────────────────────────────
export const addRoundSchema = z.object({
  round_type: z.enum(
    ["aptitude", "technical", "hr", "group_discussion", "coding"],
    { required_error: "Round type is required" }
  ),
  outcome: z.enum(["pending", "passed", "failed"]),
  questions_asked: z.string().optional(),
});

// ── Profile Name Edit ────────────────────────────────────────────────────
export const profileNameSchema = z.object({
  full_name: z.string().min(1, "Name cannot be empty"),
});

// ── Change Password ──────────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(1, "New password is required")
      .min(6, "New password must be at least 6 characters"),
    confirm_new_password: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "New passwords do not match",
    path: ["confirm_new_password"],
  });
