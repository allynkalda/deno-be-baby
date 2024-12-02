import { Client } from "https://deno.land/x/postgres/mod.ts";

// Load environment variables (use Deno.env for runtime configs)
const client = new Client({
    user: "myuser", // Match the POSTGRES_USER
    password: "mypassword", // Match the POSTGRES_PASSWORD
    database: "mydatabase", // Match the POSTGRES_DB
    hostname: "localhost", // Docker maps to localhost
    port: 5432, // PostgreSQL's default port
  });
  
export const connectDB = async () => {
    await client.connect();
    console.log("Connected to PostgreSQL database!");
}

export const disconnectDB = async () => {
    await client.end();
    console.log("Disconnected from PostgreSQL database!");
}

export { client };
