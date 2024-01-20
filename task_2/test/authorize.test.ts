import { handler } from "../index";
import { DynamoDB } from "aws-sdk";
import HttpStatus from "http-status-codes";

const dbClient = new DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "eu-west-1",
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  }),
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
  await dbClient
    .put({
      TableName: "groups",
      Item: {
        id: group_id,
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "users",
      Item: {
        id: adminId,
        group_id,
        role: "admin",
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "users",
      Item: {
        id: guestId,
        group_id,
        role: "guest",
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "resources",
      Item: {
        id: "1",
        group_id,
        value: 1,
      },
    })
    .promise();
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

  await dbClient
    .put({
      TableName: "users",
      Item: {
        id: adminId,
        group_id: group_id + 1,
        role: "admin",
      },
    })
    .promise();

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

test("get existing item with group mismatch", async () => {
  await dbClient
    .put({
      TableName: "resources",
      Item: {
        id: "1",
        group_id: group_id + 1,
        value: 1,
      },
    })
    .promise();

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
