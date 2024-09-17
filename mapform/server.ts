// server.ts
import { Application, Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { multiParser } from "https://deno.land/x/multiparser@0.114.0/mod.ts";

const app = new Application();
const router = new Router();

// Serve static files
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

// Handle POST request to save location
router.post("/save-location", async (context) => {
  const body = context.request.body();
  if (body.type === "json") {
    const value = await body.value;
    const { latitude, longitude } = value;
    console.log(`Saving location: Latitude ${latitude}, Longitude ${longitude}`);
    // Here you would typically save to a database
    context.response.body = { success: true, message: "Location saved successfully" };
  } else {
    context.response.status = 400;
    context.response.body = { success: false, message: "Invalid data format" };
  }
});


//Clodinary stuff
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_API_KEY = "YOUR_API_KEY";
const CLOUDINARY_API_SECRET = "YOUR_API_SECRET";


//form upload
router.post("/incident", async (context) => {
    const body = await multiParser(context.request.serverRequest);
    const file = body.files.image;
    
    // if (!file) {
    //   context.response.status = 400;
    //   context.response.body = { success: false, message: "No file uploaded" };
    //   return;
    // }
  
    try {
      const formData = new FormData();
      formData.append("file", new Blob([file.content]), file.filename);
      formData.append("upload_preset", "YOUR_UPLOAD_PRESET");
  console.log("Yessss...........")
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Basic ${btoa(CLOUDINARY_API_KEY + ":" + CLOUDINARY_API_SECRET)}`,
          },
        }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        context.response.body = { success: true, url: result.secure_url };
      } else {
        context.response.status = 500;
        context.response.body = { success: false, message: "Upload to Cloudinary failed" };
      }
    } catch (error) {
      console.error("Error:", error);
      context.response.status = 500;
      context.response.body = { success: false, message: "Server error" };
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });