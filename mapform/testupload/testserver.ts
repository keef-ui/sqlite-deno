import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";


const app = new Application();
const router = new Router();

// Serve static files from the "public" directory
app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/public`,
      index: "index2.html",
    });
  } catch {
    await next();
  }
});

router.post("/upload", async (context) => {
  try {
    const body = context.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxSize: 10 * 1024 * 1024 }); // 10 MB limit

    const file = formData.files?.[0];
    console.log(file.originalName)
    if (!file) {
      context.response.status = 400;
      context.response.body = { message: "No file uploaded" };
      return;
    }

    // Ensure the uploads directory exists
    await Deno.mkdir("uploads", { recursive: true });

 
    const filePath = `uploads/${file.originalName}`;



    // Check if file.content is available
    if (!file.content) {
      throw new Error("File content is missing");
    }



    // Write the file to the uploads directory
    await Deno.writeFile(filePath, file.content);

    context.response.body = { 
      message: "File uploaded successfully", 
      filename: file.originalName,
      originalFilename: file.filename
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    context.response.status = 500;
    context.response.body = { message: `Error uploading file: ${error.message}` };
  }
});


//incident form 
router.post("/incident", async (context) => {
  try {
    const body = context.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxSize: 10 * 1024 * 1024 }); // 10 MB limit

    const file = formData.files?.[0];
    console.log(file.originalName)
    if (!file) {
      context.response.status = 400;
      context.response.body = { message: "No file uploaded" };
      return;
    }

    console.log(formData.fields.latitude)
    // Ensure the uploads directory exists
    await Deno.mkdir("uploads", { recursive: true });

 
    const filePath = `uploads/${file.originalName}`;



    // Check if file.content is available
    if (!file.content) {
      throw new Error("File content is missing");
    }



    // Write the file to the uploads directory
    await Deno.writeFile(filePath, file.content);

    context.response.body = { 
      message: "File uploaded successfully", 
      filename: file.originalName,
      originalFilename: file.filename
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