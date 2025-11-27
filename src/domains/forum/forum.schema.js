import Joi from "joi";

const postForumSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(1).required(),
});

const addCommentSchema = Joi.object({
  content: Joi.string().min(1).required(),
});

export { postForumSchema, addCommentSchema };