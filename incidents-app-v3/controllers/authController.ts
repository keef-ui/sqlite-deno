import { create } from "https://deno.land/x/djwt/mod.ts";
import { key, COOKIE_AGE } from "../middleware/authMiddleware";


// Login route
export const login = async (ctx) => {
  if (ctx.state.body) {
    const { username, password } = ctx.state.body;

    // Here you should implement proper authentication
    if (username === "user" && password === "password") {
      const jwt = await create({ alg: "HS512", typ: "JWT" }, { username }, key);

      // Set the JWT as a cookie
      await ctx.cookies.set("token", jwt, {
        httpOnly: true,
        secure: false, // Use this in production with HTTPS
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
};

// Logout route
export const logout = async (ctx: RouterContext) => {
    // Remove the JWT token
    await ctx.cookies.delete("token", { path: "/" });
    // ctx.response.body = { message: "Logout successful" };
    ctx.response.redirect("/login");
};  