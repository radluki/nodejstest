import { dbClient, TableNames } from "../common/db";

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
    const res = await dbClient.get({ TableName: TableNames.resources, Key: { id } }).promise();
    return res?.Item ? new Resource(<any>res.Item) : undefined;
  }

  async save() {
    const params = {
      TableName: TableNames.resources,
      Item: {
        id: this.id,
        value: this.value,
        group_id: this.groupId,
      },
    };

    try {
      await dbClient.put(params).promise();
    } catch (error) {
      console.error("Error saving resource:", error);
      throw new Error("Error saving resource");
    }
  }
}
