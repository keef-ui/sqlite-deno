import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Model } from "../../db/orm.ts";
import "jsr:@std/dotenv/load";
import { v2 as cloudinary } from "npm:cloudinary";
import { uploadPromiseDenoCloudinary } from "../../cloudinary/uploadPromiseDenoCloudinary.ts";

const app = new Application();
const router = new Router();

const db_connectionString: string = Deno.env.get("SQLITECLOUD_URL_INCIDENT");
const db_table = 'incident';
const  cl_name=Deno.env.get("CLOUDINARY_NAME")
const cl_key=Deno.env.get("CLOUDINARY_KEY")
const cl_secret=Deno.env.get("CLOUDINARY_SECRET")

// Cloudinary configuration
cloudinary.config({ 
  cloud_name:cl_name , 
  api_key: cl_key , 
  api_secret:cl_secret  // Click 'View API Keys' above to copy your API secret
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
})
.post("/edgetest",async (context) => {
//edgefunction calling url -format -> https://edge_url/funtion-1?apikey=YOUR_API_KEY
 // TODO: Takeout all apis keys

  console.log("edgetest")


  const url = "https://cmfjiktliz.sqlite.cloud:8090/v2/functions/function-1?apikey=uUjUGuTffgwEgNyHQ3pP6UbI6A2oR5Ie4o6RfDcHbZo&limit=-1";
  
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: "a"})
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    // return new Response(JSON.stringify(data), {
    //   headers: { "Content-Type": "application/json" },
    // });
    context.response.body = JSON.stringify(data.data.result);
  } catch (error) {
    // return new Response(JSON.stringify({ error: error.message }), {
    //   status: 500,
    //   headers: { "Content-Type": "application/json" },
    // });
    context.response.body = JSON.stringify({ error: error.message });
  }
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });



