import { Router } from "https://deno.land/x/oak/mod.ts";
// import { membersPage } from "../controllers/protectedController.ts";
import { membersPage,getIncidents, updateIncident , deleteIncident } from "../controllers/protectedControllers.ts"

const router = new Router();

//Memners page list all incidents
router.get("/members", membersPage);

//api routes
router.get("/api/members/incidents",getIncidents );

// Incident update route
router.post("/api/members/incident_update",updateIncident );
router.post("/api/members/delete", deleteIncident);

export default router;
