import { Response } from 'express';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: unknown
  ) {
    super(message);
  }
}

export function handleApiError(res: Response, error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      error: error.error instanceof Error ? error.error.message : undefined,
    });
  }

  return res.status(500).json({
    message:
      error instanceof Error ? error.message : 'An unexpected error occurred',
  });
}
