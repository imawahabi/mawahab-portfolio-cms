export const PROJECT_COUNT_OFFSET = 60;

export const getDisplayProjectCount = (count: number | null | undefined) => {
  return (Number(count) || 0) + PROJECT_COUNT_OFFSET;
};
