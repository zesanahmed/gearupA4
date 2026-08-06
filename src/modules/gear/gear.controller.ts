import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { gearService } from "./gear.service";

export const createGear = catchAsync(async (req: Request, res: Response) => {
  const gear = await gearService.createGear(req.user!.userId, req.body);
  res.status(201).json(new ApiResponse("Gear item created successfully", gear));
});

export const updateGear = catchAsync(async (req: Request, res: Response) => {
  const gear = await gearService.updateGear(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );
  res.status(200).json(new ApiResponse("Gear item updated successfully", gear));
});

export const gearController = {
  createGear,
  updateGear,
};
