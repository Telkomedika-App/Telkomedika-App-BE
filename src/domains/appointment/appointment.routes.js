import express from "express";
import appointmentController from "./appointment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requestValidator from "../../middlewares/request-validator.middleware.js";
import { createAppointmentSchema } from "./appointment.schema.js";
import errorMiddleware from "../../middlewares/error.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware.authenticate,
  requestValidator(createAppointmentSchema),
  errorMiddleware.errorCatcher(appointmentController.create.bind(appointmentController))
);

router.get(
  "/",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.list.bind(appointmentController))
);

router.get(
  "/my",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.getMy.bind(appointmentController))
);

router.get(
  "/:id",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.getById.bind(appointmentController))
);

router.post(
  "/:id/cancel",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.cancel.bind(appointmentController))
);

router.post(
  "/:id/confirm",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.confirm.bind(appointmentController))
);

router.post(
  "/:id/complete",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.complete.bind(appointmentController))
);

router.post(
  "/:id/status",
  authMiddleware.authenticate,
  errorMiddleware.errorCatcher(appointmentController.updateStatus.bind(appointmentController))
);

export default router;