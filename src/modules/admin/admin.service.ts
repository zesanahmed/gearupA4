import prisma from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { userSelect } from "../auth/auth.constants.js";
import { rentalOrderInclude } from "../rentalOrder/rentalOrder.constants.js";
import type { UpdateUserStatusInput } from "./admin.validation.js";

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatus = async (
  adminId: string,
  targetUserId: string,
  payload: UpdateUserStatusInput,
) => {
  if (adminId === targetUserId) {
    throw new ApiError(400, "You cannot change your own account status");
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { status: payload.status },
    select: userSelect,
  });
};

const getAllGear = async () => {
  return prisma.gearItem.findMany({
    include: {
      category: true,
      provider: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllRentals = async () => {
  return prisma.rentalOrder.findMany({
    include: rentalOrderInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
