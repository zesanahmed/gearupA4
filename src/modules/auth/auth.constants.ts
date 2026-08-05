export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  createdAt: true,
} as const;

export const INVALID_CREDENTIALS = "Invalid email or password";
