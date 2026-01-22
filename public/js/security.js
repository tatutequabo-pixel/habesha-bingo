// Currently simple client-side security check (host password)
export function validateHostPassword(input) {
  const HOST_PASSWORD = "Greenday1";
  return input === HOST_PASSWORD;
}
