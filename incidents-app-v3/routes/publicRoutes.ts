import { Router } from "https://deno.land/x/oak/mod.ts";
import { landingPage,incidentForm } from "../controllers/publicController.ts";

const router = new Router();

router.get("/", landingPage);

// Incident form
router.post("/api/public/incident_form", incidentForm);

export default router;
