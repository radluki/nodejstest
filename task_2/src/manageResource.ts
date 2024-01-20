import { Resource } from "models/resource";
import { User } from "models/user";

export async function getResource(resourceId: string): Promise<number> {
  const resource = await Resource.getById(resourceId);
  return resource.value;
}

export async function updateResource(resourceId: string, userId: string): Promise<number> {
  const resource = await Resource.tryGetById(resourceId);
  if (resource) {
    resource.value += 1;
    await resource.save();
    return resource.value;
  }

  const user = await User.getById(userId);
  const newResource = new Resource({ id: resourceId, value: 0, group_id: user.groupId });
  await newResource.save();
  return newResource.value;
}
