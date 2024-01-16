import { authorized } from "./src/authorized";
import { updateResource, getResource } from "./src/manageResource";
import type { APIGatewayEvent } from "aws-lambda";

export const handler = async function (event: Partial<APIGatewayEvent>) {
  try {
    const { userId, resourceId } = event.pathParameters!;
    const action = event.httpMethod; // Assume the value is either GET or PATCH

    // TODO: authorize user access to the resource
    // write it in file src/authorize.ts and import to use here

    // TODO: return value from resource or update it
    // write it in file src/manageResource.ts and import to use here

    return { statusCode: 200, body: JSON.stringify({}) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};
