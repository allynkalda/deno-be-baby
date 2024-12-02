import { serve } from "https://deno.land/std/http/server.ts";
import { createChild } from "./db/child.ts";
import { connectDB, disconnectDB } from "./db/client.ts";
import { createMeasurement } from "./db/measurement.ts";
import { createUser, getUserByEmail } from './db/user.ts'

await connectDB()

const corsHeader = {
  "Access-Control-Allow-Origin": "https://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

const handler = async (req: Request): Promise<Response> => {
const url = new URL(req.url);
const pathname = url.pathname;

console.log("Request Method:", req.method);
console.log("Request URL:", req.url);
console.log("Request Headers:", [...req.headers]);

 console.log(`Received request: ${req.url}`);

  if (pathname === "/") {
    return new Response("Hello from Deno server!", {
      headers: corsHeader,
    });
  }

  if (pathname === "/user" && req.method === "POST") {
    try {
        const body = await req.json();
        const { first_name, last_name, email } = body;
  
        if (!first_name || !last_name || !email) {
          return new Response("Missing required fields", { status: 400 });
        }
  
        const newUser = await createUser(first_name, last_name, email);
        return new Response(JSON.stringify(newUser), {
          headers: corsHeader,
          status: 201,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Failed to create user", { status: 500 });
      } finally {
        await disconnectDB()
      }
  }

  if (pathname === "/user" && req.method === "GET") {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    try {
        if (!email) {
            return new Response("Missing required fields", { status: 400 });
        }
        const user = await getUserByEmail(email);
        return new Response(JSON.stringify(user), {
          headers: corsHeader,
          status: 201,
        });
    } catch (error) {
      console.error("Error retrieve user:", error);
      return new Response("Failed to retrieve user", { status: 500 });
    } finally {
        await disconnectDB()
    }
  }

  if (pathname === "/child" && req.method === "POST") {
      try {
        const body = await req.json();
        const { first_name, birthdate, parent_id, sex } = body;

        if (!first_name || !birthdate || !parent_id) {
            return new Response("Missing required fields", { status: 400 });
        }

        const newChild = await createChild(first_name, birthdate, parent_id, sex);
        return new Response(JSON.stringify(newChild), {
          headers: corsHeader,
          status: 201,
        });
      } catch (error) {
        console.error("Error creating child:", error);
        return new Response("Failed to create child", { status: 500 });
      } finally {
        await disconnectDB()
      }
  }

  if (pathname === "/measurement" && req.method === "POST") {
    try {
      const body = await req.json();
      const { child_id, date, weight, height } = body;

      if (!child_id || !date || (!weight && !height)) {
          return new Response("Missing required fields", { status: 400 });
      }

      const newChild = await createMeasurement(child_id, date, weight, height);
      return new Response(JSON.stringify(newChild), {
        headers: corsHeader,
        status: 201,
      });
    } catch (error) {
      console.error("Error creating measurement:", error);
      return new Response("Failed to create measurement", { status: 500 });
    } finally {
      await disconnectDB()
    }
}

  return new Response("Not Found", { status: 404 });
};

console.log("Deno server running at http://localhost:8080");
serve(handler, { port: 8080 });
