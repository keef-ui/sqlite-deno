import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";
import { Model } from "../../db/orm-buggy";
import { router, db_connectionString, db_table } from "../jwttest";

const handle = new Handlebars(); //Templating with handlebars (Refer to folders : views->Layouts|Partials|Pages)
export const membersPage = async (ctx) => {
    const html = await handle.renderView("allincidents", {}, "allincidents");
  
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



