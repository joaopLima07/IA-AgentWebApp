import type { Organization, User } from "@/types";

export const mockUser: User = {
  id: "usr_1",
  name: "João Pedro Lima",
  email: "joaopedro.mlima9@gmail.com",
  role: "ADMIN",
  organizationId: "org_1",
  createdAt: "2025-10-01T09:00:00Z",
};

export const mockOrganization: Organization = {
  id: "org_1",
  name: "Northwind Retail",
  plan: "ENTERPRISE",
};
