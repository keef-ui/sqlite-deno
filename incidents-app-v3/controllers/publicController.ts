import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";
import { uploadPromiseDenoCloudinary } from "../../cloudinary/uploadPromiseDenoCloudinary";
import { Model } from "../../db/orm-buggy";
import { router, db_connectionString, db_table } from "../jwttest";

const handle = new Handlebars(); //Templating with handlebars (Refer to folders : views->Layouts|Partials|Pages)
//landing page
export const landingPage = async (ctx) => {
    const html = await handle.renderView("home_page", {}, "home_page");
  
    ctx.response.body = html;

  }

  //Incident form api (Landing page contains incident form)
export const incidentForm = async (ctx) => {
console.log("/api/public/incident_form....");
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
};
