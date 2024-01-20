import { authorized } from "./src/authorized";
import { updateResource, getResource } from "./src/manageResource";
import type { APIGatewayEvent } from "aws-lambda";
import HttpStatus from "http-status-codes";

function validateEvent(event: Partial<APIGatewayEvent>) {
  const { userId, resourceId } = event.pathParameters!;
  const action = event.httpMethod;
  const isValid = (userId && resourceId && action === "PATCH") || action === "GET";
  return isValid
    ? {
        userId: <string>userId,
        resourceId: <string>resourceId,
        action: <"PATCH" | "GET">action,
      }
    : false;
}

export const handler = async function (event: Partial<APIGatewayEvent>) {
  try {
    const validatedEventParams = validateEvent(event);
    if (!validatedEventParams)
      return { statusCode: 400, body: JSON.stringify({ message: "Bad request" }) };
    const { userId, resourceId, action } = validatedEventParams;

    const isAuthorized = await authorized(userId, resourceId, action);
    if (!isAuthorized)
      return { statusCode: 403, body: JSON.stringify({ message: "Unauthorized" }) };

    let res = { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, body: <any>{} };
    if (action === "GET") {
      res = await getResource(resourceId)
        .then((value) => ({ statusCode: HttpStatus.OK, body: { value } }))
        .catch((e) => ({ statusCode: HttpStatus.NOT_FOUND, body: { message: e.message } }));
    } else if (action === "PATCH") {
      res = await updateResource(resourceId, userId).then((value) => ({
        statusCode: HttpStatus.ACCEPTED,
        body: { value },
      }));
    }
    return { statusCode: res.statusCode, body: JSON.stringify(res.body) };
  } catch (error) {
    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, body: JSON.stringify({ error }) };
  }
};
