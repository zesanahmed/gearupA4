import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { authService } from "./auth.service.js";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(new ApiResponse("User registered successfully", result));
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json(new ApiResponse("Login successful", result));
});

const me = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.status(200).json(new ApiResponse("User fetched successfully", user));
});

export const authController = {
  register,
  login,
  me,
};
