import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Model } from "../../db/orm.ts";
import "jsr:@std/dotenv/load";
import { v2 as cloudinary } from "npm:cloudinary";
import { uploadPromiseDenoCloudinary } from "../../cloudinary/uploadPromiseDenoCloudinary.ts";

const app = new Application();
const router = new Router();

const db_connectionString: string = Deno.env.get("SQLITECLOUD_URL_INCIDENT");
const db_table = 'incident';

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: 'dou1jgie5', 
  api_key: '759725938855265', 
  api_secret: 'DemvlZMt4efeKtwEaH_gvbEhUIA' // Click 'View API Keys' above to copy your API secret
});

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

// Incident form
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

    console.log("fields: ", formData.fields);
    console.log("file name: " + file.originalName);

    //Upload file to Cloudinary
    // Create a promise to handle the upload_stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "incidents",
          public_id: `incident_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert the file content to a ReadableStream
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(file.content);
          controller.close();
        },
      });

      // Pipe the ReadableStream to the Cloudinary upload stream
      readableStream.pipeTo(new WritableStream({
        write(chunk) {
          uploadStream.write(chunk);
        },
        close() {
          uploadStream.end();
        },
      }));
    });

    // Wait for the upload to complete
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
    context.response.body = {
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
    context.response.status = 500;
    context.response.body = {
      message: `Oops... something went wrong: ${error.message}`,
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });



