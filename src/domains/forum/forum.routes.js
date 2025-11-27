import ForumController from "./forum.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { postForumSchema, addCommentSchema } from './forum.schema.js';

class ForumRoutes extends BaseRoutes {
  constructor() {
    super(ForumController);
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
      this.errCatch(this.controller.getAllPosts.bind(this.controller))
    ]);
    this.router.get("/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.errCatch(this.controller.getPostById.bind(this.controller))
    ]);
    this.router.post("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.validate(postForumSchema),
      this.errCatch(this.controller.createPost.bind(this.controller))
    ]);
    this.router.post("/:id/comments", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.validate(addCommentSchema),
      this.errCatch(this.controller.addComment.bind(this.controller))
    ]);
  }
}

export default new ForumRoutes().router;
