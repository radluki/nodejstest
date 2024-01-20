import { dbClient, TableNames } from "../common/db";
import { Role } from "./role";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class User {
  id;
  role;
  groupId;

  constructor(input: { id: string; role: string; group_id: string }) {
    this.id = input.id;
    this.role = Role.from(input.role);
    this.groupId = input.group_id;
  }

  static async getById(id: string) {
    const res = await this.tryGetById(id);
    if (!res) {
      throw new Error("User does not exist");
    }
    return res;
  }

  static async tryGetById(id: string) {
    const res = await dbClient.send(
      new GetItemCommand({
        TableName: TableNames.users,
        Key: marshall({ id }),
      }),
    );

    return res?.Item ? new User(<any>unmarshall(res.Item)) : undefined;
  }
}
