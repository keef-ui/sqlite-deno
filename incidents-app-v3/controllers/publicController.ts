import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";

const handle = new Handlebars(); //Templating with handlebars (Refer to folders : views->Layouts|Partials|Pages)
export const landingPage = async (ctx) => {
    const html = await handle.renderView("home_page", {}, "home_page");
  
    ctx.response.body = html;
    // ctx.response.redirect("/members/index.html");
  }