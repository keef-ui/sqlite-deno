import { Router } from "https://deno.land/x/oak/mod.ts";
import { landingPage,incidentForm,loginPage } from "../controllers/publicController.ts";

const router = new Router();

router.get("/", landingPage);


// login form
router.get("/login", loginPage);

// Incident form
router.post("/api/public/incident_form", incidentForm);

export default router;
