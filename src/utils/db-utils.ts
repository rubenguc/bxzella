import type { FilterQuery, Model, PopulateOptions } from "mongoose";

type AnyObject = Record<string, any>;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: AnyObject;
  projection?: AnyObject;
  populate?: PopulateOptions | string | (PopulateOptions | string)[];
}

export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
}

export async function getPaginatedData<T>(
  model: Model<T>,
  findCriteria: FilterQuery<T>,
  {
    projection = {},
    page = 1,
    limit = 10,
    sortBy = {
      _id: -1,
    },
    populate,
  }: PaginationParams = {},
): Promise<PaginationResponse<T>> {
  const skip = page * limit;

  const query = model.find(findCriteria, projection);

  if (populate) {
    // @ts-expect-error ---
    query.populate(populate);
  }

  const [totalItems, data] = await Promise.all([
    model.countDocuments(findCriteria, projection),
    query.sort(sortBy).skip(skip).limit(limit).lean<T[]>(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    totalPages,
  };
}
