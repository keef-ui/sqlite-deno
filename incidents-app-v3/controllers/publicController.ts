import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";
import { uploadPromiseDenoCloudinary } from "../../cloudinary/uploadPromiseDenoCloudinary";
import { Model_sqlite_cloud as Model } from "../../db/orm-core";
import { router, db_connectionString, db_table } from "../app";
import { Model_sqlite_cloud as Modeltest } from "../../db/orm-test";



//Handlebars cobfig - Add custom helper functions here
const config = {
  helpers: {
    ifEquals: (arg1, arg2, options) => { //Set Select input field 
      return  (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    },
    formatDateUK: (datetime) => { //Set Select input field 
      const date = new Date(datetime); 
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }; 
      return date.toLocaleDateString('en-GB', options);
    },
    ifEquals: (arg1, arg2, options) => { return (arg1 === arg2) ? options.fn(this) : options.inverse(this); }
  },

}

const handle = new Handlebars(config); //Templating with handlebars (Refer to folders : views->Layouts|Partials|Pages)


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

export const loginPage = async (ctx) => {
    console.log("/login....");
    const html = await handle.renderView("login", {}, "main");
  
    ctx.response.body = html;
    // ctx.response.redirect("/members/index.html");
  };

  export const testPage = async (ctx) => {
    const range = ctx.request.url.searchParams.get("range")|| "all";
    console.log("/testpage....render all incidents with handlebars ",range);

    await Modeltest.initialize(db_connectionString);
    class Incident extends Modeltest {
      static tableName = db_table;
    }
    let incidents;
    if (range === "week") {
      incidents = await Incident.findThisWeek();      
    } else if (range === "month")  {
      incidents = await Incident.findThisMonth();
    } else {
      incidents = await Incident.findAll();
    }
    // console.log(incidents);
    const html = await handle.renderView("members_page", {incidents,title:"All incidents",range}, "members_page");
  
    ctx.response.body = html;
    // ctx.response.redirect("/members/index.html");
  };