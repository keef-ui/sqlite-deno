import { verify } from "https://deno.land/x/djwt/mod.ts";
import {
  send
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
// import { LOGIN_REDIRECT, key, PROTECTED_PATHS } from "./jwttest";


//--jwt stuff
export const COOKIE_AGE = 60 * 60 * 24;
export const PROTECTED_PATHS = [
  "/admin",
  "/members",
  "/api/members",
];
export const LOGIN_REDIRECT = "/login";
export const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

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
export async function protectedPathMiddleware(ctx: any, next: () => Promise<void>) {
  const path = ctx.request.url.pathname;
  // console.log("protectedPathMiddleware :",path)
  // List of protected paths
  const protectedPaths = PROTECTED_PATHS;

  // Check if the requested path is protected
  if (protectedPaths.some((protectedPath) => path.startsWith(protectedPath))) {
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
