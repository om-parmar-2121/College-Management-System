import { Document, Query } from 'mongoose';

export const applyQueryParams = <T extends Document>(
  mongooseQuery: Query<T[], T>,
  queryParams: any
) => {
  let query = mongooseQuery;
  const filters: any = {};

  const limit = queryParams.limit ? parseInt(queryParams.limit as string) : undefined;
  const sortBy = queryParams.sortBy as string;
  const sortOrder = queryParams.sortOrder === 'asc' || queryParams.sortOrder === 'true' ? 1 : -1;

  for (const [key, val] of Object.entries(queryParams)) {
    if (!['limit', 'sortBy', 'sortOrder', 'select'].includes(key)) {
      if (val !== undefined && val !== null && val !== '') {
        const dbKey = key === 'id' ? '_id' : key;
        filters[dbKey] = val;
      }
    }
  }

  if (Object.keys(filters).length > 0) {
    query = query.find(filters);
  }

  if (sortBy) {
    query = query.sort({ [sortBy]: sortOrder });
  }

  if (limit) {
    query = query.limit(limit);
  }

  return query;
};
