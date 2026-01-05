// doctor-profile.schema.js
import Joi from "joi";

const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).messages({
    "string.min": "Name must be at least 3 characters long.",
  }),
  email: Joi.string().email().messages({
    "string.email": "Email must be a valid email address.",
  }),
  phone: Joi.string()
    .pattern(/^[0-9+\-() ]{8,20}$/)
    .messages({
      "string.pattern.base": "Phone number must be 8-20 digits and can include +, -, (, ) or spaces.",
    }),
  old_password: Joi.string()
    .when('password', {
      is: Joi.exist(),
      then: Joi.required().messages({
        "string.empty": "Old password is required to change password.",
      }),
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base": "Password must contain at least 1 uppercase letter and 1 special character.",
    }),
  password_confirmation: Joi.string()
    .valid(Joi.ref("password"))
    .when('password', {
      is: Joi.exist(),
      then: Joi.required().messages({
        "any.only": "Password confirmation does not match password.",
        "string.empty": "Password confirmation is required.",
      }),
    }),
}).min(1).messages({
  "object.min": "At least one field is required to update.",
});

export { updateProfileSchema };