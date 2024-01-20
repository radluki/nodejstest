import { Resource } from "models/resource";
import { Role } from "models/role";
import { User } from "models/user";

export async function authorized(
  userId: string,
  resourceId: string,
  action: "GET" | "PATCH",
): Promise<boolean> {
  // TODO: write authorization logic here
  // user can GET the resource if they've got GUEST or ADMIN access to the group where resource belongs
  // user can PATCH the resource if they've got ADMIN access to the group where resource belongs
  const user = await User.tryGetById(userId);
  const resource = await Resource.tryGetById(resourceId);
  if (action === "GET") {
    return user !== undefined && (!resource || user.groupId === resource.groupId);
  }
  if (action === "PATCH") {
    return (
      user !== undefined &&
      (!resource || (user.role === Role.ADMIN && user.groupId === resource.groupId))
    );
  }
  return false;
}
