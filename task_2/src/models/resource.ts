import { dbClient, TableNames } from "../common/db";
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class Resource {
  id;
  value;
  groupId;

  constructor(input: { id: string; value: number; group_id: string }) {
    this.id = input.id;
    this.value = input.value;
    this.groupId = input.group_id;
  }

  static async getById(id: string) {
    const res = await this.tryGetById(id);
    if (!res) {
      throw new Error("Resource does not exist");
    }
    return res;
  }

  static async tryGetById(id: string) {
    const res = await dbClient.send(
      new GetItemCommand({
        TableName: TableNames.resources,
        Key: marshall({ id }),
      }),
    );
    return res?.Item ? new Resource(<any>unmarshall(res.Item)) : undefined;
  }

  async save() {
    const params = {
      TableName: TableNames.resources,
      Item: marshall({
        id: this.id,
        value: this.value,
        group_id: this.groupId,
      }),
    };

    try {
      await dbClient.send(new PutItemCommand(params));
    } catch (error) {
      console.error("Error saving resource:", error);
      throw new Error("Error saving resource");
    }
  }
}
