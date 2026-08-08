import type { GearItemModel } from "../../generated/prisma/models/GearItem.js";
import prisma from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  buildRentalOrderCreateData,
  calculateRentalDays,
  calculateTotalAmount,
  type ResolvedOrderItem,
} from "./rentalOrder.mapper.js";
import {
  PROVIDER_ALLOWED_TRANSITIONS,
  CUSTOMER_CANCELLABLE_FROM,
  rentalOrderInclude,
} from "./rentalOrder.constants.js";
import type {
  CreateRentalOrderInput,
  UpdateOrderStatusInput,
} from "./rentalOrder.validation.js";

const getOwnOrderOrThrow = async (orderId: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: rentalOrderInclude,
  });

  if (!order) {
    throw new ApiError(404, "Rental order not found");
  }
  if (order.customerId !== customerId) {
    throw new ApiError(403, "You can only access your own rental orders");
  }

  return order;
};

const getProviderOrderOrThrow = async (orderId: string, providerId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: rentalOrderInclude,
  });

  if (!order) {
    throw new ApiError(404, "Rental order not found");
  }

  const belongsToProvider = order.items.every(
    (item: { gearItem: { providerId: string } }) =>
      item.gearItem.providerId === providerId,
  );

  if (!belongsToProvider) {
    throw new ApiError(403, "You can only manage orders for your own gear");
  }

  return order;
};

// ---- Create ----

const createRentalOrder = async (
  customerId: string,
  payload: CreateRentalOrderInput,
) => {
  const gearItemIds = payload.items.map((item) => item.gearItemId);

  const gearItems: GearItemModel[] = await prisma.gearItem.findMany({
    where: { id: { in: gearItemIds } },
  });

  if (gearItems.length !== gearItemIds.length) {
    throw new ApiError(404, "One or more gear items were not found");
  }

  const uniqueProviders = new Set(gearItems.map((g) => g.providerId));
  if (uniqueProviders.size > 1) {
    throw new ApiError(
      400,
      "All items in a single order must belong to the same provider",
    );
  }

  const gearItemMap = new Map(gearItems.map((g) => [g.id, g]));
  const resolvedItems: ResolvedOrderItem[] = [];

  for (const requested of payload.items) {
    const gear = gearItemMap.get(requested.gearItemId)!;

    if (!gear.isAvailable) {
      throw new ApiError(400, `"${gear.name}" is currently unavailable`);
    }
    if (gear.stock < requested.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for "${gear.name}". Available: ${gear.stock}, requested: ${requested.quantity}`,
      );
    }

    resolvedItems.push({
      gearItemId: gear.id,
      quantity: requested.quantity,
      priceAtBooking: gear.pricePerDay,
    });
  }

  const rentalDays = calculateRentalDays(payload.startDate, payload.endDate);
  const totalAmount = calculateTotalAmount(resolvedItems, rentalDays);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.rentalOrder.create({
      data: buildRentalOrderCreateData(
        customerId,
        payload.startDate,
        payload.endDate,
        resolvedItems,
        totalAmount,
      ),
      include: rentalOrderInclude,
    });

    for (const item of resolvedItems) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return order;
};

// ---- Read ----

const getCustomerOrders = async (customerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { customerId },
    include: rentalOrderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const getProviderOrders = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: rentalOrderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const getOrderByIdForUser = async (
  orderId: string,
  userId: string,
  role: string,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: rentalOrderInclude,
  });

  if (!order) {
    throw new ApiError(404, "Rental order not found");
  }

  const isOwner = order.customerId === userId;
  const isFulfillingProvider = order.items.some(
    (item: { gearItem: { providerId: string } }) =>
      item.gearItem.providerId === userId,
  );

  if (role !== "ADMIN" && !isOwner && !isFulfillingProvider) {
    throw new ApiError(403, "You do not have access to this rental order");
  }

  return order;
};

// ---- Status updates ----

const updateOrderStatus = async (
  providerId: string,
  orderId: string,
  payload: UpdateOrderStatusInput,
) => {
  const order = await getProviderOrderOrThrow(orderId, providerId);

  const allowedNextStatuses = PROVIDER_ALLOWED_TRANSITIONS[order.status] ?? [];

  if (!allowedNextStatuses.includes(payload.status)) {
    throw new ApiError(
      409,
      `Cannot change order status from "${order.status}" to "${payload.status}"`,
    );
  }

  return prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: payload.status },
    include: rentalOrderInclude,
  });
};

const cancelOrder = async (customerId: string, orderId: string) => {
  const order = await getOwnOrderOrThrow(orderId, customerId);

  if (!CUSTOMER_CANCELLABLE_FROM.includes(order.status)) {
    throw new ApiError(
      409,
      `Order cannot be cancelled from status "${order.status}"`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const cancelled = await tx.rentalOrder.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: rentalOrderInclude,
    });

    for (const item of order.items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return cancelled;
  });
};

const markOrderAsPaid = async (orderId: string) => {
  return prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });
};

export const rentalOrderService = {
  createRentalOrder,
  getCustomerOrders,
  getProviderOrders,
  getOrderByIdForUser,
  updateOrderStatus,
  cancelOrder,
  markOrderAsPaid,
};
