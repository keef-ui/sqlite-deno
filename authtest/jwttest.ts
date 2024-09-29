import { Application, Router, send } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { create, verify } from "https://deno.land/x/djwt/mod.ts";
import { Model } from "../db/orm.ts";
import "jsr:@std/dotenv/load";

const app = new Application();
const router = new Router();

const db_connectionString: string = Deno.env.get("SQLITECLOUD_URL_INCIDENT");
const db_table = 'incident';
const COOKIE_AGE = 60 * 60 * 24;
const PROTECTED_PATHS=[ "/admin","/members/index.html","/members","/api/incidents" ];
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

//api routes

router.get("/api/incidents", async (ctx) => {
    // const result = await client.queryObject("SELECT id, title, author, summary FROM book");
    // DB Insertion of incident form
    //DB init
    await Model.initialize(db_connectionString);
    class Incident extends Model {
        static tableName = db_table;
      }

    const allIncidents = await Incident.findAll();
    console.log(allIncidents);

    const mockIncidents = [
        { id: 1, email: "Book One", latitude: "Author One", time: "Summary of book one." },
        { id: 2, email: "Book Two", latitude: "Author Two", time: "Summary of book two." },
        { id: 3, email: "Book Three", latitude: "Author Three", time: "Summary of book three." },
      ];
    // ctx.response.body = result.rows;
    ctx.response.body = allIncidents;
  });


app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });

