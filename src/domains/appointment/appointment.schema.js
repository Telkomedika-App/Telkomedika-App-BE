import Joi from "joi";

const createAppointmentSchema = Joi.object({
  doctor_id: Joi.string().uuid().required().messages({
    "string.empty": "Doctor ID is required.",
    "string.guid": "Doctor ID must be a valid UUID.",
  }),
  date: Joi.date().iso().required().min("now").messages({
    "date.base": "Date must be a valid date.",
    "date.iso": "Date must be in ISO format.",
    "date.min": "Date must be in the future.",
  }),
});

const updateAppointmentSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED")
    .required()
    .messages({
      "string.empty": "Status is required.",
      "any.only": "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED.",
    }),
});

export { createAppointmentSchema, updateAppointmentSchema };