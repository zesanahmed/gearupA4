import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { rentalOrderService } from "./rentalOrder.service.js";
import type {
  CreateRentalOrderInput,
  UpdateOrderStatusInput,
} from "./rentalOrder.validation.js";

const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const { body } = req.validated as { body: CreateRentalOrderInput };
  const order = await rentalOrderService.createRentalOrder(
    req.user!.userId,
    body,
  );
  res
    .status(201)
    .json(new ApiResponse("Rental order created successfully", order));
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await rentalOrderService.getCustomerOrders(req.user!.userId);
  res
    .status(200)
    .json(new ApiResponse("Rental orders fetched successfully", orders));
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { params } = req.validated as { params: { id: string } };
  const order = await rentalOrderService.getOrderByIdForUser(
    params.id,
    req.user!.userId,
    req.user!.role,
  );
  res
    .status(200)
    .json(new ApiResponse("Rental order fetched successfully", order));
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const { params } = req.validated as { params: { id: string } };
  const order = await rentalOrderService.cancelOrder(
    req.user!.userId,
    params.id,
  );
  res
    .status(200)
    .json(new ApiResponse("Rental order cancelled successfully", order));
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await rentalOrderService.getProviderOrders(req.user!.userId);
  res
    .status(200)
    .json(new ApiResponse("Provider orders fetched successfully", orders));
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { body, params } = req.validated as {
    body: UpdateOrderStatusInput;
    params: { id: string };
  };
  const order = await rentalOrderService.updateOrderStatus(
    req.user!.userId,
    params.id,
    body,
  );
  res
    .status(200)
    .json(new ApiResponse("Order status updated successfully", order));
});

export const rentalOrderController = {
  createRentalOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getProviderOrders,
  updateOrderStatus,
};
