import { handler } from "../index";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import HttpStatus from "http-status-codes";
import { marshall } from "@aws-sdk/util-dynamodb";

const dbClient = new DynamoDBClient({
  region: "eu-west-1",
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT || undefined,
});

beforeEach(async () => {
  await setUpDbContent();
});

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
  jest.clearAllMocks();
});

const guestId = "123";
const adminId = "1";
const group_id = "33";

async function setUpDbContent() {
  await dbClient.send(
    new PutItemCommand({
      TableName: "groups",
      Item: marshall({
        id: group_id,
      }),
    }),
  );

  await dbClient.send(
    new PutItemCommand({
      TableName: "users",
      Item: marshall({
        id: adminId,
        group_id,
        role: "admin",
      }),
    }),
  );

  await dbClient.send(
    new PutItemCommand({
      TableName: "users",
      Item: marshall({
        id: guestId,
        group_id,
        role: "guest",
      }),
    }),
  );

  await dbClient.send(
    new PutItemCommand({
      TableName: "resources",
      Item: marshall({
        id: "1",
        group_id,
        value: 1,
      }),
    }),
  );
}

test("guest cannot patch", async () => {
  const { statusCode } = await handler({
    pathParameters: { userId: guestId, resourceId: "1" },
    httpMethod: "PATCH",
  });

  expect(statusCode).toBe(HttpStatus.FORBIDDEN);
});

test("unknown user cannot patch", async () => {
  const { statusCode } = await handler({
    pathParameters: { userId: "654", resourceId: "1" },
    httpMethod: "PATCH",
  });

  expect(statusCode).toBe(HttpStatus.FORBIDDEN);
});

test("admin patch should increment existing resource", async () => {
  const pathParameters = { userId: adminId, resourceId: "1" };

  const { statusCode, body } = await handler({
    pathParameters,
    httpMethod: "PATCH",
  });

  expect(statusCode).toBe(HttpStatus.ACCEPTED);
  expect(JSON.parse(body)).toStrictEqual({ value: 2 });
});

test("get after admin patch increment", async () => {
  const pathParameters = { userId: adminId, resourceId: "1" };

  const res1 = await handler({
    pathParameters,
    httpMethod: "PATCH",
  });
  expect(res1.statusCode).toBe(HttpStatus.ACCEPTED);

  const { statusCode, body } = await handler({
    pathParameters,
    httpMethod: "GET",
  });

  expect(statusCode).toBe(HttpStatus.OK);
  expect(JSON.parse(body)).toStrictEqual({ value: 2 });
});

test("admin patch should not increment existing resource if groups mismatch", async () => {
  const pathParameters = { userId: adminId, resourceId: "1" };

  await dbClient.send(
    new PutItemCommand({
      TableName: "users",
      Item: marshall({
        id: adminId,
        group_id: group_id + 1,
        role: "admin",
      }),
    }),
  );

  const { statusCode, body } = await handler({
    pathParameters,
    httpMethod: "PATCH",
  });

  expect(statusCode).toBe(HttpStatus.FORBIDDEN);
});

test("admin patch should create resource if it was nonexistent", async () => {
  const pathParameters = { userId: adminId, resourceId: "2" };

  const { statusCode, body } = await handler({
    pathParameters,
    httpMethod: "PATCH",
  });

  expect(statusCode).toBe(HttpStatus.ACCEPTED);
  expect(JSON.parse(body)).toStrictEqual({ value: 0 });
});

test("get after admin patch created resource", async () => {
  const pathParameters = { userId: adminId, resourceId: "2" };

  const res1 = await handler({
    pathParameters,
    httpMethod: "PATCH",
  });
  expect(res1.statusCode).toBe(HttpStatus.ACCEPTED);

  const { statusCode, body } = await handler({
    pathParameters,
    httpMethod: "GET",
  });

  expect(statusCode).toBe(HttpStatus.OK);
  expect(JSON.parse(body)).toStrictEqual({ value: 0 });
});

test("get existing item", async () => {
  const { statusCode, body } = await handler({
    pathParameters: { userId: guestId, resourceId: "1" },
    httpMethod: "GET",
  });

  expect(statusCode).toBe(HttpStatus.OK);
  expect(JSON.parse(body)).toStrictEqual({ value: 1 });
});

test("get existing item with unknown user", async () => {
  const { statusCode, body } = await handler({
    pathParameters: { userId: "555", resourceId: "1" },
    httpMethod: "GET",
  });

  expect(statusCode).toBe(HttpStatus.FORBIDDEN);
});

test("get existing item with group mismatch", async () => {
  await dbClient.send(
    new PutItemCommand({
      TableName: "resources",
      Item: marshall({
        id: "1",
        group_id: group_id + 1,
        value: 1,
      }),
    }),
  );

  const { statusCode, body } = await handler({
    pathParameters: { userId: guestId, resourceId: "1" },
    httpMethod: "GET",
  });

  expect(statusCode).toBe(HttpStatus.FORBIDDEN);
});

test("get nonexisting item", async () => {
  const { statusCode, body } = await handler({
    pathParameters: { userId: guestId, resourceId: "11" },
    httpMethod: "GET",
  });

  expect(statusCode).toBe(HttpStatus.NOT_FOUND);
  expect(JSON.parse(body)).toStrictEqual({ message: "Resource does not exist" });
});

test("invalid action/httpMethod should return bad request", async () => {
  const { statusCode, body } = await handler({
    pathParameters: { userId: guestId, resourceId: "1" },
    httpMethod: "PUT",
  });

  expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
  expect(JSON.parse(body)).toStrictEqual({ message: "Bad request" });
});
