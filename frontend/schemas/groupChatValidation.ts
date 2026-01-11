
import { z } from "zod";

export const createChatSchema = z.object({
  title: z
    .string()
    .min(4,{message:"chat title must be 4 characters long"})
    .max(191,{message:'chat title must be less than 191'}),

  passcode: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(25,{message:'passcode length must be less than 25'}),
}).required();

export type createChatSchemaType = z.infer<typeof createChatSchema>;