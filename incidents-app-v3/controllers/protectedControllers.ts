import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";
import { Model_sqlite_cloud as Model } from "../../db/orm-core";
import { router, db_connectionString, db_table } from "../jwttest";



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
const handle = new Handlebars(); //Templating with handlebars (Refer to folders : views->Layouts|Partials|Pages)

//members Page
export const membersPage = async (ctx) => {
  const range = ctx.request.url.searchParams.get("range")|| "all";
  console.log("/testpage....render all incidents with handlebars ",range);

  await Model.initialize(db_connectionString);
  class Incident extends Model {
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

  export const getIncidents = async (ctx) => {
    console.log("/api/incidents....fetching incidents");
    await Model.initialize(db_connectionString);
    class Incident extends Model {
      static tableName = db_table;
    }
  
    const allIncidents = await Incident.findAll();
    console.log(allIncidents);
  
    // ctx.response.body = result.rows;
    ctx.response.body = allIncidents;
  };  


  export const updateIncident = async (ctx) => {
    console.log("post /api/members/incident_update....");
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
        status: formData.fields.status
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
  }

  export const deleteIncident = async (ctx) => {
    console.log("/api/incidents/delete....deleting incident");
    // Extract ID from URL params
    const body = ctx.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxSize: 10 * 1024 * 1024 }); // 10 MB limit

    console.log("fields: ", formData.fields);

    const id=formData.fields.id;
  
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { message: "ID is required" };
      return;
    }
  
    await Model.initialize(db_connectionString);
    class Incident extends Model {
      static tableName = db_table;
    }
  
    // Check if the record exists
    const incident = await Incident.findBy({id:id});
  
    if (!incident) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Incident not found" };
      return;
    }
  
    // Delete the record
    const result = await Incident.delete(id);
  
    console.log({result});
    // ctx.response.body = { message: `Incident with ID ${id} deleted` };
    ctx.response.redirect("/members");
  };
  


