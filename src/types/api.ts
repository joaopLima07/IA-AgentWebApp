/**
 * Generic envelope the future Spring Boot API is expected to return.
 * Keeping mocks in this shape means swapping the transport later
 * requires no changes to consuming components.
 */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export class ApiRequestError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}
