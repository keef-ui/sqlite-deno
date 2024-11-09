import {
  Application,
  Router,
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";
import { v2 as cloudinary } from "npm:cloudinary";
import "jsr:@std/dotenv/load";
import { protectedPathMiddleware} from "./middleware/authMiddleware.ts";
import authRoutes from "./routes/authRoutes.ts";
import publicRoutes from "./routes/publicRoutes.ts";
import protectedRoutes from "./routes/protectedRoutes.ts";

// import { membersPage } from "./controllers/protectedControllers.ts";

const  cl_name=Deno.env.get("CLOUDINARY_NAME")
const cl_key=Deno.env.get("CLOUDINARY_KEY")
const cl_secret=Deno.env.get("CLOUDINARY_SECRET")
// Cloudinary configuration
cloudinary.config({ 
  cloud_name:cl_name , 
  api_key: cl_key , 
  api_secret:cl_secret  // Click 'View API Keys' above to copy your API secret
});

//Web server
const app = new Application();
export const router = new Router();
const handle = new Handlebars(); //Templating with handlebars (Refer to folders : views->Layouts|Partials|Pages)



//DB
if (!Deno.env.get("SQLITECLOUD_URL_INCIDENT"))
  console.error(".env Error: SQLITECLOUD_URL_INCIDENT not set");

export const db_connectionString: string = Deno.env.get("SQLITECLOUD_URL_INCIDENT");
export const db_table = "incident";
// //-- example creating table
// class My_custom_table extends Model {
//     static tableName = db_table;
//   }

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

// Use static files and dynamic routes protection middleware
app.use(protectedPathMiddleware);


app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
app.use(protectedRoutes.routes());
app.use(protectedRoutes.allowedMethods());
app.use(publicRoutes.routes());
app.use(publicRoutes.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
