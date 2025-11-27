import BaseService from "../../common/base_classes/base-service.js";

class ForumService extends BaseService {
  constructor() {
    super();
    // this.error = BaseError
    // this.db = Prisma
  }
  
  async getAllPosts() {
    const posts = await this.db.forumPost.findMany({
      include: {
        author: {
          select: { name: true }
        },
        comments: {
          include: {
            author: { select: { name: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    });
    return posts;
  }

  async getPostById(id) {
    const post = await this.db.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true }
        },
        comments: {
          include: {
            author: { select: { name: true } }
          }
        }
      }
    });
    return post;
  }

  async createPost(info, author_id) {
    const { title, content } = info

    const created = await this.db.forumPost.create({
      data: {
        author_id,
        title,
        content
      },
    });

    return created;
  }

  async addComment(id, info, author_id) {
    const { content } = info

    const created = await this.db.forumComment.create({
      data: {
        author_id,
        post_id: id,
        content
      },
    });

    return created;
  }
}

export default new ForumService();
