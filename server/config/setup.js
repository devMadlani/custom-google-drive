import { client, connectDb } from "./db.js";

try {
  const db = await connectDb();
  const command = "collMod";
  await db.command({
    [command]: "users",
    validator: {
      $jsonSchema: {
        required: ["_id", "name", "email", "password", "rootDirId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          name: {
            bsonType: "string",
            minLength: 3,
            description: "Name must be at least 3 characters long",
          },
          email: {
            bsonType: "string",
            pattern: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/",
            description: "Email must be a valid email address",
          },
          password: {
            bsonType: "string",
            minLength: 3,
          },
          rootDirId: {
            bsonType: "objectId",
          },
        },
        additionalProperties: false,
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  });

  await db.command({
    [command]: "directories",
    validator: {
      $jsonSchema: {
        required: ["_id", "name", "parentDirId", "userId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          name: {
            bsonType: "string",
          },
          parentDirId: {
            bsonType: ["objectId", "null"],
          },
          userId: {
            bsonType: "objectId",
          },
        },
        additionalProperties: false,
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  });

  await db.command({
    [command]: "files",
    validator: {
      $jsonSchema: {
        required: ["_id", "name", "extension", "parentDir", "userId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          extension: {
            bsonType: "string",
          },
          name: {
            bsonType: "string",
          },
          parentDir: {
            bsonType: ["objectId", "null"],
          },
          userId: {
            bsonType: "objectId",
          },
        },
        additionalProperties: false,
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  });
} catch (error) {
  console.log("Error", error);
} finally {
  client.close();
}
