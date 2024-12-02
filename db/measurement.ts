import { client } from "./client.ts";

export async function createMeasurement(child_id: string, date: string, weight: number, height: string) {
    const query = `
        INSERT INTO "Measurement" (child_id, date, weight, height)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const result = await client.queryObject({
        text: query,
        args: [child_id, date, weight, height]
    })
    return result.rows[0];
}
