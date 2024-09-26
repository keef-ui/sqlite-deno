import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { create, verify } from "https://deno.land/x/djwt/mod.ts";
import { Cookie } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

// Middleware to parse JSON
app.use(async (ctx, next) => {
  if (ctx.request.hasBody) {
    const body = ctx.request.body();
    if (body.type === "json") {
      ctx.state.body = await body.value;
    }
  }
  await next();
});

// Middleware to check if user is authenticated
async function authMiddleware(ctx: any, next: () => Promise<void>) {
  const token = await ctx.cookies.get("token");
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { message: "No authentication token provided" };
    return;
  }
  
  try {
    const payload = await verify(token, key);
    ctx.state.user = payload;
    await next();
  } catch (err) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid token" };
  }
}

// Public route
router.get("/", (ctx) => {
  ctx.response.body = "Welcome to the public page!";
});

// Login route
router.post("/login", async (ctx) => {
  if (ctx.state.body) {
    const { username, password } = ctx.state.body;
    
    // Here you should implement proper authentication
    if (username === "user" && password === "password") {
      const jwt = await create({ alg: "HS512", typ: "JWT" }, { username }, key);
      
      // Set the JWT as a cookie
      await ctx.cookies.set("token", jwt, {
        httpOnly: true,
        secure: false,  // Use this in production with HTTPS
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day in seconds
        path: "/",
      });
      
      ctx.response.body = { message: "Login successful" };
    } else {
      ctx.response.status = 401;
      ctx.response.body = { message: "Invalid credentials" };
    }
  } else {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid request body" };
  }
});

// Protected route
router.get("/protected", authMiddleware, (ctx) => {
  ctx.response.body = `Welcome to the protected page, ${ctx.state.user.username}!`;
});

// Logout route
router.post("/logout", async (ctx) => {
  await ctx.cookies.delete("token");
  ctx.response.body = { message: "Logout successful" };
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });