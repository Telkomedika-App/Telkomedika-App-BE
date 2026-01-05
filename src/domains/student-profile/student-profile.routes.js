import StudentProfileController from "./student-profile.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { updateProfileSchema } from './student-profile.schema.js';

class StudentProfileRoutes extends BaseRoutes {
  constructor() {
    super(StudentProfileController);
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
      this.auth.role([this.roles.STUDENT]),
      this.errCatch(this.controller.getProfile.bind(this.controller))
    ]);
    this.router.patch("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.validate(updateProfileSchema),
      this.errCatch(this.controller.updateProfile.bind(this.controller))
    ]);
  }
}

export default new StudentProfileRoutes().router;
