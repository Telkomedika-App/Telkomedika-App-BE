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
    try {
      const data = await this.service.getAllPosts();
      return this.response.success(
        res,
        data,
        `Posts fetched successfully.`
      );
    } catch (err) {
      return next(err);
    }
  }

  async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await this.service.getPostById(id);
      return this.response.success(
        res,
        data,
        `Post fetched successfully.`
      );
    } catch (err) {
      return next(err);
    }
  }

  async createPost(req, res, next) {
    try {
      const info = req.body || {};

      if (!info.title || !info.content) {
        return next(this.error.unprocessable("Title and content are required."));
      }

      const author_id = req.user?.id;
      if (!author_id) {
        return next(this.error.unauthorized("User authentication failed."));
      }

      const data = await this.service.createPost(info, author_id);

      return this.response.created(
        res,
        data,
        "Post created successfully."
      );
    } catch (err) {
      return next(err);
    }
  }
  async deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const data = await this.service.deletePost(id, user);
    return this.response.success(res, data, "Post deleted.");
  } catch (err) {
    next(err);
  }
}

async deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const data = await this.service.deleteComment(id, user);
    return this.response.success(res, data, "Comment deleted.");
  } catch (err) {
    next(err);
  }
}


  async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const info = req.body || {};

      if (!info.content) {
        return next(this.error.unprocessable("Comment content is required."));
      }

      const author_id = req.user?.id;
      if (!author_id) {
        return next(this.error.unauthorized("User authentication failed."));
      }

      const data = await this.service.addComment(id, info, author_id);

      return this.response.created(
        res,
        data,
        "Comment created successfully."
      );
    } catch (err) {
      return next(err);
    }
  }
}

export default new ForumController();
