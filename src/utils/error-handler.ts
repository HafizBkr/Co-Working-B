export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inconnue s\'est produite';
};

export const handleServiceError = (error: unknown, context: string): never => {
  const message = getErrorMessage(error);
  throw new Error(`${context}: ${message}`);
};
