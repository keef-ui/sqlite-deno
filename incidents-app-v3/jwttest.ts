import {
  Application,
  Router,
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";
import { v2 as cloudinary } from "npm:cloudinary";
import { uploadPromiseDenoCloudinary } from "../cloudinary/uploadPromiseDenoCloudinary.ts";
// import { Model } from "../db/orm.ts";
import { Model } from "../db/orm-buggy.ts";
import "jsr:@std/dotenv/load";
import { protectedPathMiddleware} from "./middleware/authMiddleware.ts";
import authRoutes from "./routes/authRoutes.ts";
import publicRoutes from "./routes/publicRoutes.ts";

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

const db_connectionString: string = Deno.env.get("SQLITECLOUD_URL_INCIDENT");
const db_table = "incident";
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

// Use static file middleware
app.use(protectedPathMiddleware);

//Landing page route
router.get("/", async (ctx) => {
  const html = await handle.renderView("home_page", {}, "home_page");

  ctx.response.body = html;
  // ctx.response.redirect("/members/index.html");
});

// Protected route

router.get("/members/update_incident", async (ctx) => {
  const url = new URL(ctx.request.url);
  const incidentId = url.searchParams.get("id");
  console.log("/members/update_incident?id=", incidentId);
  if (incidentId) {
    const html = await handle.renderView(
      "updateincident",
      { incidentId },
      "main"
    );

    ctx.response.body = html;
  } else {
    ctx.response.status = 400;
    ctx.response.body = "Incident ID is required";
  }
});



//Memners page list all incidents
router.get("/members", async (ctx) => {
  const html = await handle.renderView("allincidents", {}, "allincidents");

  ctx.response.body = html;
  // ctx.response.redirect("/members/index.html");
});

//api routes

router.get("/api/incidents", async (ctx) => {
  console.log("/api/incidents....fetching incidents");
  await Model.initialize(db_connectionString);
  class Incident extends Model {
    static tableName = db_table;
  }

  const allIncidents = await Incident.findAll();
  console.log(allIncidents);

  // ctx.response.body = result.rows;
  ctx.response.body = allIncidents;
});

// Incident form
router.post("/api/incident", async (ctx) => {
  console.log("post /api/incident....");
  try {
    const body = ctx.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxSize: 10 * 1024 * 1024 }); // 10 MB limit

    const file = formData.files?.[0];
   
    if (!file) {
      ctx.response.status = 400;
      ctx.response.body = { message: "No file uploaded" };
      return;
    }

    console.log("fields: ", formData.fields);
    console.log("file name: " + file.originalName);

    //Upload file to Cloudinary
    const uploadResult = await uploadPromiseDenoCloudinary(file);

    // DB Insertion of incident form
    await Model.initialize(db_connectionString);

    class Incident extends Model {
      static tableName = db_table;
    }


    // const uploadResultsecure_url = file.originalFilename
    // Insert the form data into the database
    await Incident.insert({
      email: formData.fields.email,
      description: formData.fields.description || "No description provided",
      latitude: formData.fields.latitude,
      longitude: formData.fields.longitude,
      address: formData.fields.address || "No address provided",
      image: uploadResult.secure_url,
    });

    // Return success response
    ctx.response.body = {
      message: "File uploaded successfully",
      filename: file.originalName,
      cloudinaryUrl: uploadResult.secure_url,
      latitude: formData.fields.latitude,
      longitude: formData.fields.longitude,
      success: true,
    };
    Model.database.close();
  } catch (error) {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: `Oops... something went wrong: ${error.message}`,
    };
  }
})

// Incident update route
router.post("/api/incident_update", async (ctx) => {
  console.log("post /api/incident_update....");
  try {

    const body = ctx.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxSize: 10 * 1024 * 1024 }); // 10 MB limit

    console.log("fields: ", formData.fields);

    // DB Update of incident form
    await Model.initialize(db_connectionString);
    class Incident extends Model {
      static tableName = db_table;
    }

    // Update the form data in the database
    await Incident.update({
      id: formData.fields.id,
      email: formData.fields.email,
      description: formData.fields.description || "No description provided",
      address: formData.fields.address || "No address provided",
      notes: formData.fields.notes || "No address provided",
    });

    // Return success response
    ctx.response.body = {
      message: "Record updated successfully",
      success: true,
    };
    Model.database.close();
  } catch (error) {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: `Oops... something went wrong: ${error.message}`,
    };
  }
});

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
// app.use(protectedRoutes.routes());
// app.use(protectedRoutes.allowedMethods());
app.use(publicRoutes.routes());
app.use(publicRoutes.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
