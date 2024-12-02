import { client } from "./client.ts";

export async function createUser(first_name: string, last_name: string, email: string) {
  const query = `
    INSERT INTO "User" (first_name, last_name, email)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const result = await client.queryObject({
    text: query,
    args: [first_name, last_name, email],
  });
  return result.rows[0];
  }
  
  export async function getUserByEmail(email: string) {
    const query = `SELECT * FROM "User" WHERE email = $1`;
    const result = await client.queryObject({
      text: query,
      args: [email]
    });
    return result.rows[0];
  }
