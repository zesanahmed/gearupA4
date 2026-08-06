import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { adminService } from "./admin.service";
import type { UpdateUserStatusInput } from "./admin.validation";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();
  res.status(200).json(new ApiResponse("Users fetched successfully", users));
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { body, params } = req.validated as {
    body: UpdateUserStatusInput;
    params: { id: string };
  };
  const user = await adminService.updateUserStatus(
    req.user!.userId,
    params.id,
    body,
  );
  res
    .status(200)
    .json(new ApiResponse("User status updated successfully", user));
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const gear = await adminService.getAllGear();
  res
    .status(200)
    .json(new ApiResponse("Gear listings fetched successfully", gear));
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const rentals = await adminService.getAllRentals();
  res
    .status(200)
    .json(new ApiResponse("Rental orders fetched successfully", rentals));
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
