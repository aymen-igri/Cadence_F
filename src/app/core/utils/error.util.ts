export function extractErrorMessage(err: any): string {
  if (!err) return 'Unknown error';

  if (err.error && typeof err.error === 'object') {
    return err.error.message || 'Something went wrong';
  }

  if (typeof err.error === 'string') {
    try {
      const parsed = JSON.parse(err.error);
      return parsed.message || err.error;
    } catch {
      return err.error;
    }
  }

  return err.message || 'Something went wrong';
}
