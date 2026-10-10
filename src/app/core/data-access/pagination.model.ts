/** Request values shared by paginated API endpoints. */
export interface PageRequest {
  page: number;
  pageSize: number;
}

/** Standard response shape to map from any paginated backend endpoint. */
export interface PageResult<T> {
  items: T[];
  totalRecords: number;
}
