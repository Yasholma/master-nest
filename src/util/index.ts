export const recursivelyStripNullValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(recursivelyStripNullValues);
  }

  if (value !== null && typeof value === 'object') {
    return (Object as any).fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        recursivelyStripNullValues(value),
      ]),
    );
  }

  if (value instanceof Date) {
    return value;
  }

  if (value !== null) {
    return value;
  }
};
