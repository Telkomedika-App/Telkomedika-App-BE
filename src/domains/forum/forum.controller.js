import ForumService from "./forum.service.js";
import BaseController from "../../common/base_classes/base-controller.js";

class ForumController extends BaseController {
  constructor() {
    super(ForumService);
    // this.error = BaseError
    // this.response = BaseResponse
    // this.service = ForumService
  }

  async getAllPosts(req, res, next) {
    const data = await this.service.getAllPosts();
    return this.response.success(
      res,
      data,
      `Posts fetched successfully.`
    );
  }

  async getPostById(req, res, next) {
    const { id } = req.params;
    const data = await this.service.getPostById(id);
    return this.response.success(
      res,
      data,
      `Post fetched successfully.`
    );
  }

  async createPost(req, res, next) {
    const info = req.body;
    const author_id = req.user.id;
    const data = await this.service.createPost(info, author_id);
    return this.response.created(
      res,
      data,
      "Post created successfully."
    );
  }

  async addComment(req, res, next) {
    const { id } = req.params;
    const info = req.body;
    const author_id = req.user.id;
    const data = await this.service.addComment(id, info, author_id);
    return this.response.created(
      res,
      data,
      "Comment created successfully."
    );
  }
}

export default new ForumController();
