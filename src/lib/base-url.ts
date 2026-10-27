export function getBaseUrl() {
  return new URL(process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://developers.rixl.com");
}
