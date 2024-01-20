# Coding challenge

In this task you have to finish simple application.

This application allows users to:

1. Get 'resource' by id. 'resource' is an object containing some numerical value and string id. If there is no resource with id provided in request, error 404 should be returned. Every user (both ADMIN and GUEST) can do that.
2. Update 'resource'. Update modifies value of existing resource by increasing it by one. If there is no resource. then it should be created with 0 value. Only ADMIN users can do this.

The database contains 3 tables:

- 'users': `{id: string; role: "admin" | "guest"; group_id: string}`
- 'groups': `{id: string}`
- 'resources': `{id: string; value: number; group_id: string}`

Start by looking into [index](index.ts) file and completing the TODOs there.

[Tests](test/authorize.test.ts) are there to help you, you should write one more test to check if update is working.
