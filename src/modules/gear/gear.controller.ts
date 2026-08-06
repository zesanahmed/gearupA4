import type { Request, Response } from "express";

import { ApiResponse } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";
import { gearService } from "./gear.service";
import type {
  CreateGearInput,
  GetGearQuery,
  UpdateGearInput,
} from "./gear.validation";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const { body } = req.validated as { body: CreateGearInput };
  const gear = await gearService.createGear(req.user!.userId, body);
  res.status(201).json(new ApiResponse("Gear item created successfully", gear));
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const { body, params } = req.validated as {
    body: UpdateGearInput;
    params: { id: string };
  };
  const gear = await gearService.updateGear(req.user!.userId, params.id, body);
  res.status(200).json(new ApiResponse("Gear item updated successfully", gear));
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  await gearService.deleteGear(req.user!.userId, req.params.id as string);

  res.status(200).json(new ApiResponse("Gear item deleted successfully"));
});

const getProviderGear = catchAsync(async (req: Request, res: Response) => {
  const gear = await gearService.getProviderGear(req.user!.userId);

  res
    .status(200)
    .json(new ApiResponse("Provider gear fetched successfully", gear));
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const { query } = req.validated as { query: GetGearQuery };
  const result = await gearService.getAllGear(query);
  res
    .status(200)
    .json(new ApiResponse("Gear items fetched successfully", result));
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const gear = await gearService.getGearById(req.params.id as string);

  res.status(200).json(new ApiResponse("Gear item fetched successfully", gear));
});

export const gearController = {
  createGear,
  updateGear,
  deleteGear,
  getProviderGear,
  getAllGear,
  getGearById,
};
