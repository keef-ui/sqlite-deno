import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { v2 as cloudinary } from "https://deno.land/x/cloudinary@v1.3.0/mod.ts";

// Configure Cloudinary
// Replace these with your actual Cloudinary credentials
cloudinary.config({
  cloud_name: "your_cloud_name",
  api_key: "your_api_key",
  api_secret: "your_api_secret",
});

const app = new Application();
const router = new Router();

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

    console.log("Original filename:", file.originalName);
    console.log("Latitude:", formData.fields.latitude);

    // Check if file.content is available
    if (!file.content) {
      throw new Error("File content is missing");
    }

    // Convert Uint8Array to Base64
    const base64Image = btoa(String.fromCharCode.apply(null, file.content));

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
      public_id: `incidents/${file.originalName}`,
      overwrite: true,
    });

    context.response.body = { 
      message: "File uploaded successfully to Cloudinary", 
      originalFilename: file.originalName,
      cloudinaryUrl: cloudinaryResponse.secure_url,
      latitude: formData.fields.latitude
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    context.response.status = 500;
    context.response.body = { message: `Error uploading file: ${error.message}` };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });