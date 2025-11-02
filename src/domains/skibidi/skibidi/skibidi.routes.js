import SkibidiController from "./skibidi.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { skibidiSchema } from './skibidi.schema.js';

class SkibidiRoutes extends BaseRoutes {
  constructor() {
    super(SkibidiController);
    //this.router = Router();
    //this.auth = AuthMiddleware;
    //this.validate = Validate;
    //this.errCatch = ErrorMiddleware.errorCatcher;
    //this.controller = controller;
    //this.roles = Roles;
    //this.routes();
  }

  routes() {
    this.router.get("/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.Student]),
      this.errCatch(this.controller.someMethod.bind(this.controller))
    ]);
    this.router.post("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.Student]),
      this.validate(skibidiSchema),
      this.errCatch(this.controller.someMethod.bind(this.controller))
    ]);
  }
}

export default new SkibidiRoutes().router;
