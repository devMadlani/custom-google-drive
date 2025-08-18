import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string(),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string("Please enter a valid string")
    .min(3, "please enter atleast 3 characters")
    .max(50, "please enter at max 50 characters"),
  otp: z
    .string("please enter a valid otp ")
    .regex(/^\d{4}$/, "please enter a valid otp "),
});

export const otpSchema = z.object({
  email: z.email(),
  otp: z
    .string("please enter a valid otp ")
    .regex(/^\d{4}$/, "please enter a valid otp "),
});
