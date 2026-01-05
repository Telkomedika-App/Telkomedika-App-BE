// doctor-profile.routes.js
import DoctorProfileController from "./doctor-profile.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { updateProfileSchema } from './doctor-profile.schema.js';

class DoctorProfileRoutes extends BaseRoutes {
  constructor() {
    super(DoctorProfileController);
    //this.router = Router();
    //this.auth = AuthMiddleware;
    //this.validate = Validate;
    //this.errCatch = ErrorMiddleware.errorCatcher;
    //this.controller = controller;
    //this.roles = Roles;
    //this.routes();
  }

  routes() {
    this.router.get("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.errCatch(this.controller.getProfile.bind(this.controller))
    ]);
    this.router.patch("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.validate(updateProfileSchema),
      this.errCatch(this.controller.updateProfile.bind(this.controller))
    ]);
  }
}

export default new DoctorProfileRoutes().router;