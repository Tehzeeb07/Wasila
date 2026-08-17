// Convex wraps thrown errors with request IDs and stack traces in dev mode.
// This pulls out just the actual message you threw.
export function formatConvexError(err) {
  const message = err?.message || "Something went wrong.";
  const match = message.match(/Uncaught Error: (.+?)\s+at /s);
  return match ? match[1].trim() : message;
}