import { client } from "./client.ts";

export async function createChild(first_name: string, birthdate: string, parent_id: number, sex: string) {
    const query = `
        INSERT INTO "Child" (first_name, birthdate, parent_id, sex)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const result = await client.queryObject({
        text: query,
        args: [first_name, birthdate, parent_id, sex]
    })
    return result.rows[0];
}
