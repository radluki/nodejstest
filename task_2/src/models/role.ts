export class Role {
  static ADMIN = Symbol("admin");
  static GUEST = Symbol("guest");

  static from(input: string) {
    if (input === Role.ADMIN.description) return Role.ADMIN;
    else if (input === Role.GUEST.description) return Role.GUEST;
    else throw new Error("Unrecognized role " + input);
  }
}
