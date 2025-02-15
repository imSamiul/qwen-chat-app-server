import ms, { StringValue } from 'ms';

export function convertMs(value: string) {
  try {
    // A string could be "wider" than the values accepted by `ms`, so we assert
    // that our `value` is a `StringValue`.
    return ms(value as StringValue);
  } catch (error: unknown) {
    // Type guard to safely handle Error objects
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('An unknown error occurred');
    }
  }
}
