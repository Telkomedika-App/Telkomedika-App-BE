import DoctorAuthController from "./doctor-auth.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { loginSchema, registerSchema } from './doctor-auth.schema.js';

class DoctorAuthRoutes extends BaseRoutes {
  constructor() {
    super(DoctorAuthController);
    //this.router = Router();
    //this.auth = AuthMiddleware;
    //this.validate = Validate;
    //this.errCatch = ErrorMiddleware.errorCatcher;
    //this.controller = controller;
    //this.roles = Roles;
    //this.routes();
  }

  routes() {
    this.router.get("/list", [
      this.errCatch(this.controller.list.bind(this.controller)),
    ]);

    this.router.post("/login", [
      this.validate(loginSchema),
      this.errCatch(this.controller.login.bind(this.controller)),
    ]);
    this.router.post("/register", [
      this.validate(registerSchema),
      this.errCatch(this.controller.register.bind(this.controller)),
    ]);
  }
}

export default new DoctorAuthRoutes().router;
