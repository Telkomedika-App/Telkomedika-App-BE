import Joi from "joi";

export const createAppointmentSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Nama Lengkap dibutuhkan",
  }),
  phone: Joi.string().trim().required().messages({
    "string.empty": "No HP dibutuhkan",
  }),
  date: Joi.string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.empty": "Tanggal tidak valid (gunakan format YYYY-MM-DD)",
      "string.pattern.base": "Tanggal tidak valid (gunakan format YYYY-MM-DD)",
    }),
  time: Joi.string()
    .required()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .messages({
      "string.empty": "Waktu harus format HH:mm",
      "string.pattern.base": "Waktu harus format HH:mm",
    }),
  service: Joi.string().valid("general", "dental").required().messages({
    "any.only": "Service tidak valid (general|dental)",
  }),
  student_id: Joi.string().optional(),
  doctor_id: Joi.string().optional(),
});
