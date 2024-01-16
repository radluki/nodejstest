import { Resource } from "models/resource";

export async function getResource(resourceId: string): Promise<number> {
  const resource = await Resource.getById(resourceId);
  return resource.value;
}

export function updateResource(resourceId: string): unknown {
  // TODO: write update logic here
  // resource is {resourceId: string; value: number}
  // to update the resource, increase its value by 1
  // if the resource does not exist yet, create it with 0 value in the user's group
  return;
}
