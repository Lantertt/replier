export function isAdminUser(userId: string, adminCsv: string): boolean {
  return adminCsv
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(userId);
}
