import prisma from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateCategoryInput } from "./category.validation";

const generateSlug = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createCategory = async (payload: CreateCategoryInput) => {
  const slug = generateSlug(payload.name);

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: payload.name }, { slug }] },
  });

  if (existing) {
    throw new ApiError(409, "Category with this name already exists");
  }

  return prisma.category.create({
    data: { name: payload.name, slug },
  });
};

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

export const categoryService = {
  createCategory,
  getAllCategories,
};
