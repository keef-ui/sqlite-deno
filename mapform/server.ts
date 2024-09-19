import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Model } from "../db/orm.ts";
import "jsr:@std/dotenv/load";

const app = new Application();
const router = new Router();

const db_connectionString: string = Deno.env.get("SQLITECLOUD_URL_INCIDENT")!;
const db_table='incident'

// Serve static files from the "public" directory
app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});

//incident form
router.post("/incident", async (context) => {
  try {
    const body = context.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxSize: 10 * 1024 * 1024 }); // 10 MB limit

    const file = formData.files?.[0];
   
    if (!file) {
      context.response.status = 400;
      context.response.body = { message: "No file uploaded" };
      return;
    }

    console.log("fields: " , formData.fields);
    console.log("file name: " + file.originalName);

    // Ensure the uploads directory exists
    await Deno.mkdir("uploads", { recursive: true });
    const filePath = `uploads/${file.originalName}`;

    // Check if file.content is available
    if (!file.content) {
      throw new Error("File content is missing");
    }

    // Write the file to the uploads directory
    await Deno.writeFile(filePath, file.content);

    //  DB Insertion of incident form
    
    await Model.initialize(db_connectionString);

    class Incident extends Model {
      static tableName = db_table;
    }

    // Insert the form data into the database
    await Incident.insert({
      email: formData.fields.email,
      description: "999-Test description",
      latitude: formData.fields.latitude,
      longitude: formData.fields.longitude,
      image: file.originalName,
    });

    // Return success response
    context.response.body = {
      message: "File uploaded successfully",
      filename: file.originalName,
      originalFilename: file.filename,
      latitude: formData.fields.latitude,
      longitude: formData.fields.longitude,
      success: true,
    };
    Model.database.close();
  } catch (error) {
   
    context.response.status = 500;
    context.response.body = {
      message: `Oooops...something went wrong: ${error.message}`,
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
