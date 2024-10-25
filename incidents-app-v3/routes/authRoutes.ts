import { Router } from "https://deno.land/x/oak/mod.ts";
import { login,logout} from "../controllers/authController.ts";

const router = new Router();

router.post("/login", login);
router.get("/logout", logout);

export default router;
