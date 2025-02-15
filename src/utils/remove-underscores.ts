export const removeUnderScore = (word: string): string => {
  return word
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
};
