import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dbClient = new DynamoDBClient({
  region: "eu-west-1",
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT || undefined,
});

const TableNames = {
  users: "users",
  groups: "groups",
  resources: "resources",
};

export { dbClient, TableNames };
