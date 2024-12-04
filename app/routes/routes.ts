import { Router } from "express";
import HttpService from "../service/httpService";
import { login, refresh, register } from "../controllers/auth";
import {
  checkBodyData,
  checkDuplicatePseudo,
  findUser,
  verifyToken,
} from "../middlewares/auth.middleware";
import privateRoute from "./privateRoute";

const router = Router();

router.get("/welcome", (req, res) => {
  HttpService.sendResponse(res, 200, true, "Bienvenue");
  return;
});

router.post(
  "/register",
  [
    checkBodyData(["firstName", "lastName", "pseudo", "password"]),
    checkDuplicatePseudo,
  ],
  register
);
router.post("/signin", [checkBodyData(["pseudo", "password"])], login);
router.get("/refresh-token", [verifyToken, findUser], refresh);

router.use([verifyToken, findUser], privateRoute);

export default router;
