import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório").email("Informe um endereço de e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "O nome é obrigatório"),
    email: z.string().min(1, "O e-mail é obrigatório").email("Informe um endereço de e-mail válido"),
    phone: z.string().min(1, "O telefone é obrigatório").regex(/^\+\d{8,15}$/, "Use o formato internacional, ex.: +5511999999999"),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Za-z]/, "A senha deve conter uma letra")
      .regex(/\d/, "A senha deve conter um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório").email("Informe um endereço de e-mail válido"),
});

export const resetCodeSchema = z.object({
  token: z.string().regex(/^\d+$/, "Informe o código recebido por e-mail"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Za-z]/, "A senha deve conter uma letra")
      .regex(/\d/, "A senha deve conter um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
