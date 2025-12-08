import Role from "../role.ts";

export default class User {
    username: string;
    email: string;
    role: Role;

    constructor(
        username: string,
        email: string,
        role: Role
    ) {
        this.username = username;
        this.email = email;
        this.role = role;
    }
}
