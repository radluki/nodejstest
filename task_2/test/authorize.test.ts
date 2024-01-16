import { handler } from "../index";
import { DynamoDB } from "aws-sdk";

const dbClient = new DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "eu-west-1",
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  }),
});

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
  jest.clearAllMocks();
});

test("Disallowed", async () => {
  await dbClient
    .put({
      TableName: "groups",
      Item: {
        id: "1",
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "users",
      Item: {
        id: "1",
        group_id: "1",
        role: "admin",
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "resources",
      Item: {
        id: "1",
        group_id: "1",
        value: 1,
      },
    })
    .promise();

  const { statusCode } = await handler({
    pathParameters: { userId: "123", resourceId: "1" },
    httpMethod: "PATCH",
  });

  expect(statusCode).toBe(403);
});

test("Allowed", async () => {
  await dbClient
    .put({
      TableName: "groups",
      Item: {
        id: "1",
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "users",
      Item: {
        id: "1",
        group_id: "1",
        role: "admin",
      },
    })
    .promise();

  await dbClient
    .put({
      TableName: "resources",
      Item: {
        id: "1",
        group_id: "1",
        value: 1,
      },
    })
    .promise();

  const { statusCode, body } = await handler({
    pathParameters: { userId: "123", resourceId: "1" },
    httpMethod: "GET",
  });

  expect(statusCode).toBe(200);
  expect(body).toStrictEqual({ value: 1 });
});

test("Allowed", async () => {
  // TODO: write test checking if correct value is returned after update
});
