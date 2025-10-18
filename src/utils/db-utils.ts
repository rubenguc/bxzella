import type { FilterQuery, Model } from "mongoose";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: AnyObject;
}

export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
  // totalItems: number;
  // currentPage: number;
  // hasNextPage: boolean;
  // hasPrevPage: boolean;
}

export async function getPaginatedData<T>(
  model: Model<T>,
  findCriteria: FilterQuery<T>,
  {
    page = 1,
    limit = 10,
    sortBy = {
      _id: -1,
    },
  }: PaginationParams = {},
): Promise<PaginationResponse<T>> {
  const skip = (page - 1) * limit;

  const [totalItems, data] = await Promise.all([
    model.countDocuments(findCriteria),
    model.find(findCriteria).sort(sortBy).skip(skip).limit(limit).lean<T[]>(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    totalPages,
    // totalItems,
    // currentPage: page,
    // hasNextPage: page < totalPages,
    // hasPrevPage: page > 1,
  };
}
