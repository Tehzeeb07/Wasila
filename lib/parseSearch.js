export function parseSmartSearch(query) {
  const result = { keyword: "", maxBudget: null, minBudget: null };

  if (!query) return result;

  let text = query.toLowerCase();

  // Extract "under $X" or "below $X"
  const underMatch = text.match(/(?:under|below|less than)\s*\$?(\d+)/);
  if (underMatch) {
    result.maxBudget = Number(underMatch[1]);
    text = text.replace(underMatch[0], "");
  }

  // Extract "over $X" or "above $X"
  const overMatch = text.match(/(?:over|above|more than)\s*\$?(\d+)/);
  if (overMatch) {
    result.minBudget = Number(overMatch[1]);
    text = text.replace(overMatch[0], "");
  }

  // Remove common filler words
  text = text
    .replace(/\b(developer|expert|needed|per hour|\/hr|hourly)\b/g, "")
    .trim();

  result.keyword = text.trim();
  return result;
}