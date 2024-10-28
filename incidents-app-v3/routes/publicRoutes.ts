import { Router } from "https://deno.land/x/oak/mod.ts";
import { landingPage,incidentForm,loginPage, testPage } from "../controllers/publicController.ts";

const router = new Router();

router.get("/", landingPage);


// login form
router.get("/login", loginPage);

// Incident form
router.post("/api/public/incident_form", incidentForm);

// testpage
router.get("/test", testPage);

export default router;
