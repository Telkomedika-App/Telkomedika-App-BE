import AppointmentController from "./appointment.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { createAppointmentSchema, updateAppointmentSchema } from './appointment.schema.js';

class AppointmentRoutes extends BaseRoutes {
  constructor() {
    super(AppointmentController);
    //this.router = Router();
    //this.auth = AuthMiddleware;
    //this.validate = Validate;
    //this.errCatch = ErrorMiddleware.errorCatcher;
    //this.controller = controller;
    //this.roles = Roles;
    //this.routes();
  }

  routes() {
    this.router.get("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.errCatch(this.controller.getAllDoctors.bind(this.controller))
    ]);
    this.router.get("/student", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.errCatch(this.controller.getAllStudentAppointments.bind(this.controller))
    ]);
    this.router.get("/doctor", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.errCatch(this.controller.getAllDoctorAppointments.bind(this.controller))
    ]);
    this.router.get("/student/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.errCatch(this.controller.getStudentAppointmentById.bind(this.controller))
    ]);
    this.router.get("/doctor/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.errCatch(this.controller.getDoctorAppointmentById.bind(this.controller))
    ]);
    this.router.post("/", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.validate(createAppointmentSchema),
      this.errCatch(this.controller.createAppointment.bind(this.controller))
    ]);
    this.router.put("/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.validate(updateAppointmentSchema),
      this.errCatch(this.controller.updateAppointmentStatus.bind(this.controller))
    ]);
    this.router.put("/cancel/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.errCatch(this.controller.cancelAppointment.bind(this.controller))
    ]);
    this.router.delete("/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT, this.roles.DOCTOR]),
      this.errCatch(this.controller.deleteAppointment.bind(this.controller))
    ]);
  }
}

export default new AppointmentRoutes().router;
