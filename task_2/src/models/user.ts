import { dbClient, TableNames } from "../common/db";
import { Role } from "./role";

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
    const res = await dbClient.get({ TableName: TableNames.users, Key: { id } }).promise();
    return res?.Item ? new User(<any>res.Item) : undefined;
  }
}
