import { Router } from "https://deno.land/x/oak/mod.ts";
import { landingPage } from "../controllers/publicController.ts";

const router = new Router();

router.get("/", landingPage);

export default router;
