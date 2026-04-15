import { NextApiResponse } from 'next';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  statusCode: number;
}

export const sendSuccess = (res: NextApiResponse, data: any = null, message: string = 'Success', statusCode: number = 200) => {
  const response: ApiResponse = {
    success: true,
    data,
    message,
    statusCode,
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: NextApiResponse, error: string = 'Internal Server Error', statusCode: number = 500) => {
  const response: ApiResponse = {
    success: false,
    error,
    statusCode,
  };
  res.status(statusCode).json(response);
};

export const sendValidationError = (res: NextApiResponse, errors: Record<string, string>) => {
  const response = {
    success: false,
    errors,
    statusCode: 422,
  };
  res.status(422).json(response);
};
