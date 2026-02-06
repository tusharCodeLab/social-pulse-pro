import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserDocument {
  _id: { $oid: string };
  email: string;
  password: string;
  fullName?: string;
  createdAt: Date;
}

// Generate a key for JWT
async function getJwtKey() {
  const secret = Deno.env.get("JWT_SECRET") || "default_secret";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.pathname.split("/").pop();

  console.log(`MongoDB Auth: Processing ${action} request`);

  try {
    const mongoUri = Deno.env.get("MONGODB_URI");
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    // Log sanitized URI for debugging (hide password)
    const sanitizedUri = mongoUri.replace(/:([^:@]+)@/, ':***@');
    console.log("Connecting with URI pattern:", sanitizedUri);

    const client = new MongoClient();
    
    try {
      await client.connect(mongoUri);
      console.log("Connected to MongoDB successfully");
    } catch (connError) {
      console.error("MongoDB connection error details:", JSON.stringify(connError, null, 2));
      console.error("MongoDB connection error message:", connError instanceof Error ? connError.message : connError);
      throw new Error("Failed to connect to MongoDB database. Please check your MONGODB_URI secret.");
    }

    const db = client.database("social-media-analytics");
    const users = db.collection<UserDocument>("users");

    let response;

    switch (action) {
      case "register": {
        const { email, password, fullName } = await req.json();
        
        if (!email || !password) {
          await client.close();
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if user exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
          await client.close();
          return new Response(
            JSON.stringify({ error: "User already exists" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password);
        
        // Create user
        const insertId = await users.insertOne({
          email,
          password: hashedPassword,
          fullName: fullName || "",
          createdAt: new Date(),
        });

        console.log("User created with ID:", insertId);

        // Generate JWT
        const key = await getJwtKey();
        const token = await create(
          { alg: "HS256", typ: "JWT" },
          { 
            userId: insertId.toString(), 
            email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
          },
          key
        );

        response = {
          user: { id: insertId.toString(), email, fullName },
          token,
        };
        break;
      }

      case "login": {
        const { email, password } = await req.json();
        
        if (!email || !password) {
          await client.close();
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find user
        const user = await users.findOne({ email });
        if (!user) {
          await client.close();
          return new Response(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          await client.close();
          return new Response(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate JWT
        const key = await getJwtKey();
        const token = await create(
          { alg: "HS256", typ: "JWT" },
          { 
            userId: user._id.$oid, 
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
          },
          key
        );

        console.log("User logged in:", email);

        response = {
          user: { id: user._id.$oid, email: user.email, fullName: user.fullName },
          token,
        };
        break;
      }

      case "me": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          await client.close();
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const token = authHeader.replace("Bearer ", "");
        const key = await getJwtKey();
        
        try {
          const payload = await verify(token, key);
          const userId = payload.userId as string;
          const email = payload.email as string;

          // Optionally fetch fresh user data from MongoDB
          const user = await users.findOne({ email });
          
          response = {
            user: user ? {
              id: user._id.$oid,
              email: user.email,
              fullName: user.fullName,
            } : {
              id: userId,
              email,
            }
          };
        } catch {
          await client.close();
          return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;
      }

      default:
        await client.close();
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    await client.close();

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("MongoDB Auth Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
