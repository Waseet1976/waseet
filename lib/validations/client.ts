import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis").max(100),
  lastName: z.string().min(2, "Le nom est requis").max(100),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  phone2: z.string().optional(),
  type: z.enum(["BUYER", "SELLER", "TENANT", "LANDLORD", "INVESTOR"]),
  status: z.enum(["LEAD", "PROSPECT", "ACTIVE", "CLOSED", "LOST"]).default("LEAD"),
  nationalId: z.string().optional(),
  notes: z.string().optional(),
  preferences: z.object({
    budget: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    propertyTypes: z.array(z.string()).optional(),
    cities: z.array(z.string()).optional(),
    minRooms: z.number().optional(),
    minSurface: z.number().optional(),
  }).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
