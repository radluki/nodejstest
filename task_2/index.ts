import { authorized } from "./src/authorized";
import { updateResource, getResource } from "./src/manageResource";
import type { APIGatewayEvent } from "aws-lambda";
import HttpStatus from "http-status-codes";

function validateEvent(event: Partial<APIGatewayEvent>): Event | undefined {
  const { userId, resourceId } = event.pathParameters!;
  const action = event.httpMethod;
  const isValid = (userId && resourceId && action === "PATCH") || action === "GET";
  return isValid
    ? {
        userId: <string>userId,
        resourceId: <string>resourceId,
        action: <"PATCH" | "GET">action,
      }
    : undefined;
}

type Action = "PATCH" | "GET";
class Event {
  constructor(public userId: string, public resourceId: string, public action: Action) {}
}

async function dispatchEvent(event: Event) {
  const { userId, resourceId, action } = event;
  if (action === "GET") {
    return await getResource(resourceId)
      .then((value) => ({ statusCode: HttpStatus.OK, body: { value } }))
      .catch((e) => ({ statusCode: HttpStatus.NOT_FOUND, body: { message: e.message } }));
  } else if (action === "PATCH") {
    return await updateResource(resourceId, userId).then((value) => ({
      statusCode: HttpStatus.ACCEPTED,
      body: { value },
    }));
  }
  return { statusCode: HttpStatus.BAD_REQUEST, body: { message: "unsupported action" + action } };
}

export const handler = async function (event: Partial<APIGatewayEvent>) {
  try {
    const validatedEvent = validateEvent(event);
    if (!validatedEvent)
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: JSON.stringify({ message: "Bad request" }),
      };

    if (
      !(await authorized(validatedEvent.userId, validatedEvent.resourceId, validatedEvent.action))
    )
      return {
        statusCode: HttpStatus.FORBIDDEN,
        body: JSON.stringify({ message: "Unauthorized" }),
      };

    const res = await dispatchEvent(validatedEvent);
    return { statusCode: res.statusCode, body: JSON.stringify(res.body) };
  } catch (error) {
    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, body: JSON.stringify({ error }) };
  }
};
