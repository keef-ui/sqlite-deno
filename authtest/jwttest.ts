import { Application, Router, send } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { create, verify } from "https://deno.land/x/djwt/mod.ts";

const app = new Application();
const router = new Router();


const COOKIE_AGE = 10;
const PROTECTED_PATHS=[ "/admin","/members/index.html","/members"]
const LOGIN_REDIRECT = "/login.html";

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
    //   Redirect to login page if no token is found
    ctx.response.redirect(LOGIN_REDIRECT);
    return;
  }
  
  try {
    const payload = await verify(token, key);
    ctx.state.user = payload;
    await next();
  } catch (err) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid token" };
    ctx.response.redirect(LOGIN_REDIRECT);
  }
}

// Middleware to serve static files
async function staticFileMiddleware(ctx: any, next: () => Promise<void>) {
  const path = ctx.request.url.pathname;
  console.log(path)
  // List of protected paths
  const protectedPaths = PROTECTED_PATHS;
  
  // Check if the requested path is protected
  if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
    // If protected, use authMiddleware
    await authMiddleware(ctx, async () => {
      try {
        await send(ctx, path, {
          root: `${Deno.cwd()}/public`,
          index: "index.html",
        });
      } catch {
        await next();
      }
    });
  } else {
    // If not protected, serve the file directly
    try {
      await send(ctx, path, {
        root: `${Deno.cwd()}/public`,
        index: "index.html",
      });
    } catch {
      await next();
    }
  }
}

// Use static file middleware
app.use(staticFileMiddleware);

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
        maxAge: COOKIE_AGE, // 1 day in seconds
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

// Logout route



//redirects
router.post("/members", async (ctx) => {

    ctx.response.redirect("/members/index.html");
});
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });