import express from "express";
import appointmentController from "./appointment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requestValidator from "../../middlewares/request-validator.middleware.js";
import { createAppointmentSchema } from "./appointment.schema.js";
import errorMiddleware from "../../middlewares/error.middleware.js";

const router = express.Router();

// CREATE appointment
router.post(
  "/",
  authMiddleware.authenticate,
  requestValidator(createAppointmentSchema),
  errorMiddleware.errorCatcher(appointmentController.create.bind(appointmentController))
);

// LIST appointments (student or doctor)
router.get(
  "/",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.list.bind(appointmentController))
);

// GET MY appointments (student) - HARUS SEBELUM /:id
router.get(
  "/my",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.getMy.bind(appointmentController))
);

// GET by ID
router.get(
  "/:id",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.getById.bind(appointmentController))
);

// CANCEL
router.post(
  "/:id/cancel",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.cancel.bind(appointmentController))
);

// CONFIRM
router.post(
  "/:id/confirm",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.confirm.bind(appointmentController))
);

// COMPLETE
router.post(
  "/:id/complete",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.complete.bind(appointmentController))
);

// UPDATE STATUS (doctor only)
router.post(
  "/:id/status",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.updateStatus.bind(appointmentController))
);

export default router;