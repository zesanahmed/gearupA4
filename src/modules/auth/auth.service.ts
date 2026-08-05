import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import config from "../../config";
import { ApiError } from "../../utils/ApiError";
import { generateToken } from "../../utils/jwt";
import type { LoginInput, RegisterInput } from "./auth.validation";
import { INVALID_CREDENTIALS, userSelect } from "./auth.constants";

const registerUser = async (payload: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.BCRYPT_SALT_ROUNDS,
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      ...(payload.phone !== undefined && {
        phone: payload.phone,
      }),
    },
    select: userSelect,
  });

  const token = generateToken({ userId: user.id, role: user.role });

  return { user, token };
};

const loginUser = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(401, INVALID_CREDENTIALS);
  }

  if (user.status === "SUSPENDED") {
    throw new ApiError(
      403,
      "Your account has been suspended. Contact support.",
    );
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, INVALID_CREDENTIALS);
  }

  const token = generateToken({ userId: user.id, role: user.role });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
};
