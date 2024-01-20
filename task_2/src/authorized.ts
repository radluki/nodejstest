import { Resource } from "models/resource";
import { Role } from "models/role";
import { User } from "models/user";

export async function authorized(
  userId: string,
  resourceId: string,
  action: "GET" | "PATCH",
): Promise<boolean> {
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
