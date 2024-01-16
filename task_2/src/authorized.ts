export function authorized(userId: string, resourceId: string, action: "GET" | "PATCH"): boolean {
  // TODO: write authorization logic here
  // user can GET the resource if they've got GUEST or ADMIN access to the group where resource belongs
  // user can PATCH the resource if they've got ADMIN access to the group where resource belongs
}
