import AppointmentService from "./appointment.service.js";
import BaseController from "../../common/base_classes/base-controller.js";

class AppointmentController extends BaseController {
  constructor() {
    super(AppointmentService);
    // this.error = BaseError
    // this.response = BaseResponse
    // this.service = AppointmentService
  }

  async getAllDoctors(req, res, next) {
    const data = await this.service.getAllDoctors();
    return this.response.success(
      res,
      data,
      `Doctors fetched successfully.`
    );
  }

  async getAllStudentAppointments(req, res, next) {
    const student = req.user.id;
    const data = await this.service.getAllStudentAppointments(student);
    return this.response.success(
      res,
      data,
      `Student appointments fetched successfully.`
    );
  }

  async getAllDoctorAppointments(req, res, next) {
    const doctor = req.user.id;
    const data = await this.service.getAllDoctorAppointments(doctor);
    return this.response.success(
      res,
      data,
      `Doctor appointments fetched successfully.`
    );
  }

  async getStudentAppointmentById(req, res, next) {
    const { id } = req.params;
    const student = req.user.id;
    const data = await this.service.getStudentAppointmentById(id, student);
    return this.response.success(
      res,
      data,
      `Student appointment fetched successfully.`
    );
  }

  async getDoctorAppointmentById(req, res, next) {
    const { id } = req.params;
    const doctor = req.user.id;
    const data = await this.service.getDoctorAppointmentById(id, doctor);
    return this.response.success(
      res,
      data,
      `Doctor appointment fetched successfully.`
    );
  }

  async createAppointment(req, res, next) {
    const info = req.body;
    const student = req.user.id;
    const data = await this.service.createAppointment(info, student);
    return this.response.created(
      res,
      data,
      "Appointment created successfully."
    );
  }

  async updateAppointmentStatus(req, res, next) {
    const { id } = req.params;
    const info = req.body;
    const data = await this.service.updateAppointmentStatus(id, info);
    return this.response.success(
      res,
      data,
      "Appointment status updated successfully."
    );
  }

  async cancelAppointment(req, res, next) {
    const { id } = req.params;
    const student = req.user.id;
    const data = await this.service.cancelAppointment(id, student);
    return this.response.success(
      res,
      data,
      "Appointment cancelled successfully."
    );
  }

  async deleteAppointment(req, res, next) {
    const { id } = req.params;
    const data = await this.service.deleteAppointment(id);
    return this.response.success(
      res,
      data,
      "Appointment deleted successfully."
    );
  }
}

export default new AppointmentController();
