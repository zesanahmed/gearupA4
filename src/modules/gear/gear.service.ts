import type { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildCreateGearData, buildUpdateGearData } from "./gear.mapper";
import type {
  CreateGearInput,
  GetGearQuery,
  UpdateGearInput,
} from "./gear.validation";

const getProviderGearOrThrow = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },
  });

  if (!gear) {
    throw new ApiError(404, "Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new ApiError(403, "You can only manage your own gear listings");
  }

  return gear;
};

const createGear = async (providerId: string, payload: CreateGearInput) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return prisma.gearItem.create({
    data: buildCreateGearData(providerId, payload),
  });
};

const updateGear = async (
  providerId: string,
  gearId: string,
  payload: UpdateGearInput,
) => {
  await getProviderGearOrThrow(gearId, providerId);

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  }

  return prisma.gearItem.update({
    where: {
      id: gearId,
    },

    data: buildUpdateGearData(payload),
  });
};

const deleteGear = async (providerId: string, gearId: string) => {
  await getProviderGearOrThrow(gearId, providerId);

  await prisma.gearItem.delete({
    where: {
      id: gearId,
    },
  });
};

const getProviderGear = async (providerId: string) => {
  return prisma.gearItem.findMany({
    where: {
      providerId,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllGear = async (query: GetGearQuery) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    available,
    search,
    page,
    limit,
  } = query;

  const where: Prisma.GearItemWhereInput = {
    ...(category && {
      category: {
        slug: category,
      },
    }),

    ...(brand && {
      brand: {
        contains: brand,
        mode: "insensitive",
      },
    }),

    ...(available !== undefined && {
      isAvailable: available === "true",
    }),

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...((minPrice !== undefined || maxPrice !== undefined) && {
      pricePerDay: {
        ...(minPrice !== undefined && {
          gte: minPrice,
        }),

        ...(maxPrice !== undefined && {
          lte: maxPrice,
        }),
      },
    }),
  };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,

      include: {
        category: true,

        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.gearItem.count({
      where,
    }),
  ]);

  return {
    items,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getGearById = async (gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },

    include: {
      category: true,

      provider: {
        select: {
          id: true,
          name: true,
        },
      },

      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!gear) {
    throw new ApiError(404, "Gear item not found");
  }

  return gear;
};

export const gearService = {
  createGear,
  updateGear,
  deleteGear,
  getProviderGear,
  getAllGear,
  getGearById,
};
