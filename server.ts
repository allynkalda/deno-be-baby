import { serve } from "https://deno.land/std/http/server.ts";
import { createChild, getChildByParentId } from "./db/child.ts";
import { connectDB, disconnectDB } from "./db/client.ts";
import { createMeasurement, getWeight, getHeight } from "./db/measurement.ts";
import { createUser, getUserByEmail } from './db/user.ts'
import { convertLbsToKg, convertImperialToMetric } from "./db/utils/convertMeasurement.ts";

await connectDB()

const corsHeader = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

const handler = async (req: Request): Promise<Response> => {
const url = new URL(req.url);
const pathname = url.pathname;

 console.log(`Received request: ${req.url}`);

   // Check if the request method is OPTIONS (preflight)
   if (req.method === "OPTIONS") {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400"); // Cache preflight response for 1 day

    return new Response(null, { status: 204, headers });
  }

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
        const retrievedUser = new Response(JSON.stringify(user ?? {}), {
          headers: corsHeader,
          status: 201,
        });
        return retrievedUser
    } catch (error) {
      return new Response("Failed to retrieve user", { status: 500 });
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
    }
  }

  if (pathname === "/child" && req.method === "GET") {
    const url = new URL(req.url);
    const parent_id = url.searchParams.get("parent_id");
      try {
        if (!parent_id) {
            return new Response("Missing required fields", { status: 400 });
        }

        const retrievedChild = await getChildByParentId(parent_id);
        return new Response(JSON.stringify(retrievedChild ?? []), {
          headers: corsHeader,
          status: 201,
        });
      } catch (error) {
        console.error("Error retrieving children:", error);
        return new Response("Failed to create child", { status: 500 });
      }
  }

  if (pathname === "/measurement" && req.method === "POST") {
    try {
      let convertedWeight;
      let convertedHeight;
      const body = await req.json();
      const { child_id, date, weight, weight_unit, height, height_unit } = body;

      if (!child_id || !date || (!weight && !height)) {
          return new Response("Missing required fields", { status: 400 });
      }

      if (weight && weight_unit !== "kg") {
        convertedWeight = convertLbsToKg(weight)
      }

      if (height && height_unit !== "metric") {
        convertedHeight = convertImperialToMetric(height)
      }

      const newChild = await createMeasurement(child_id, date, weight ?? convertedWeight, height ?? convertedHeight);
      return new Response(JSON.stringify(newChild ?? {}), {
        headers: corsHeader,
        status: 201,
      });
    } catch (error) {
      console.error("Error creating measurement:", error);
      return new Response("Failed to create measurement", { status: 500 });
    }
  }

  if (pathname === "/weight" && req.method === "POST") {
    try {
      const body = await req.json();
      const { childId } = body;
      const weightData = await getWeight(childId);
      return new Response(JSON.stringify(weightData ?? {}), {
        headers: corsHeader,
        status: 201,
      });
    } catch (error) {
      console.error("Error fetching weight:", error);
      return new Response("Failed to fetch weight", { status: 500 });
    }
  }

  if (pathname === "/height" && req.method === "POST") {
    try {
      const body = await req.json();
      const { childId } = body;
      const heightData = await getHeight(childId);
      return new Response(JSON.stringify(heightData ?? {}), {
        headers: corsHeader,
        status: 201,
      });
    } catch (error) {
      console.error("Error fetching height:", error);
      return new Response("Failed to fetch height", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
};

console.log("Deno server running at http://localhost:8080");
serve(handler, { port: 8080 });
