import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    "string.empty": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

const registerSchema = Joi.object({
  name: Joi.string().required().min(4).messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 4 characters long.",
  }),
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character.",
    }),
  password_confirmation: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "string.empty": "Password confirmation is required.",
      "any.only": "Password confirmation does not match password.",
    }),
  phone: Joi.string()
    .required()
    .pattern(/^[0-9+\-() ]{8,20}$/)
    .allow("")
    .messages({
      "string.pattern.base": "Phone number must be 8-20 digits and can include +, -, (, ) or spaces.",
    }),
});

export { loginSchema, registerSchema };