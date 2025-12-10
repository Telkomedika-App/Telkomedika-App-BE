import BaseController from "../../common/base_classes/base-controller.js";
import BaseError from "../../common/base_classes/base-error.js";
import BaseResponse from "../../common/base_classes/base-response.js";
import AppointmentService from "./appointment.service.js";
import prisma from "../../common/services/prisma.service.js";
import jwt from "jsonwebtoken";

class AppointmentController extends BaseController {
  constructor() {
    super(AppointmentService);
  }

  // CREATE APPOINTMENT
  async create(req, res, next) {
    try {
      console.log("[AppointmentController.create] req.user:", req.user);
      let user = req.user || {};
      const userRole = String(user.role || "").toLowerCase();

      if (!user || !user.id) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = { id: decoded?.id, role: decoded?.role };
          } catch (_) {}
        }
      }

      const role = String(user.role || "").toLowerCase();

      if (role === "student") {
        const activeAppointment = await prisma.appointment.findFirst({
          where: {
            student_id: user.id,
            status: { in: ["PENDING", "CONFIRMED"] }
          }
        });
        if (activeAppointment) {
          throw BaseError.badRequest(
            `Anda sudah memiliki appointment aktif (Status: ${activeAppointment.status}). ` +
            `Harap selesaikan atau batalkan appointment sebelumnya terlebih dahulu.`
          );
        }
      }

      const { fullName, phone, date, time, service } = req.body;

      let student_id = role === "student" ? user.id : req.body.student_id;
      let doctor_id = role === "doctor" ? user.id : req.body.doctor_id;

      if (!student_id) {
        const byPhone = await prisma.student.findFirst({ where: { phone } });
        if (!byPhone) throw BaseError.badRequest("student_id harus ditentukan");
        student_id = byPhone.id;
      }

      if (!doctor_id) {
        const doctors = await prisma.doctor.findMany({ select: { id: true } });
        if (!doctors || doctors.length === 0) throw BaseError.notFound("Doctor tidak ditemukan");

        const activeStatuses = ["PENDING", "CONFIRMED"];
        const loads = await Promise.all(
          doctors.map((d) =>
            prisma.appointment.count({
              where: { doctor_id: d.id, status: { in: activeStatuses } },
            })
          )
        );

        let minIdx = 0;
        let minVal = loads[0] ?? 0;
        for (let i = 1; i < loads.length; i++) {
          const v = loads[i] ?? 0;
          if (v < minVal) {
            minVal = v;
            minIdx = i;
          }
        }

        doctor_id = doctors[minIdx].id;
      }

      const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!time || !timeRe.test(time)) throw BaseError.badRequest("Waktu harus format HH:mm");
      if (!["general", "dental"].includes(service.toLowerCase()))
        throw BaseError.badRequest("Service tidak valid (general|dental)");

      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) throw BaseError.badRequest("Tanggal tidak valid (format YYYY-MM-DD)");

      const [student, doctor] = await Promise.all([
        prisma.student.findUnique({ where: { id: student_id } }),
        prisma.doctor.findUnique({ where: { id: doctor_id } })
      ]);
      if (!student) throw BaseError.notFound("Student tidak ditemukan");
      if (!doctor) throw BaseError.notFound("Doctor tidak ditemukan");

      // Payload untuk create
      const payload = {
        student_id,
        doctor_id,
        fullName,
        phone,
        date: dateObj,
        time,
        service: service.toLowerCase(),
        role: role || "student",
        status: "PENDING"
      };

      const created = await this.service.create(payload);
      return BaseResponse.created(res, created, "Appointment created");
    } catch (err) {
      return next(err);
    }
  }

  // LIST APPOINTMENTS
  async list(req, res, next) {
    try {
      const user = req.user || {};
      const role = String(user.role || "").toLowerCase();
      let result;

      if (role === "student") result = await this.service.findByStudentId(user.id);
      else if (role === "doctor") result = await this.service.findAll();
      else result = await this.service.findAll();

      return BaseResponse.success(res, result, "Appointments fetched");
    } catch (err) {
      return next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || {};
      const role = String(user.role || "").toLowerCase();

      const appt = await this.service.findById(id);
      if (!appt) throw BaseError.notFound("Appointment tidak ditemukan");

      if (role === "student" && appt.student_id !== user.id)
        throw BaseError.forbidden("Akses ditolak");
      if (role === "doctor" && appt.doctor_id !== user.id)
        throw BaseError.forbidden("Akses ditolak");

      return BaseResponse.success(res, appt, "Appointment fetched");
    } catch (err) {
      return next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || {};
      const role = String(user.role || "").toLowerCase();

      const appt = await this.service.findById(id);
      if (!appt) throw BaseError.notFound("Appointment tidak ditemukan");

      if ((role === "student" && appt.student_id !== user.id) ||
          (role === "doctor" && appt.doctor_id !== user.id))
        throw BaseError.forbidden("Akses ditolak");

      const canceled = await this.service.cancel(id);
      return BaseResponse.success(res, canceled, "Appointment cancelled");
    } catch (err) {
      return next(err);
    }
  }

  async confirm(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || {};
      const role = String(user.role || "").toLowerCase();

      if (role !== "doctor") throw BaseError.forbidden("Hanya dokter yang dapat menyetujui");

      const appt = await this.service.findById(id);
      if (!appt) throw BaseError.notFound("Appointment tidak ditemukan");
      if (appt.doctor_id !== user.id) throw BaseError.forbidden("Akses ditolak");

      const updated = await this.service.confirm(id);
      return BaseResponse.success(res, updated, "Appointment confirmed");
    } catch (err) {
      return next(err);
    }
  }

  async complete(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || {};
      const role = String(user.role || "").toLowerCase();

      if (role !== "doctor") throw BaseError.forbidden("Hanya dokter yang dapat menyelesaikan");

      const appt = await this.service.findById(id);
      if (!appt) throw BaseError.notFound("Appointment tidak ditemukan");
      if (appt.doctor_id !== user.id) throw BaseError.forbidden("Akses ditolak");

      const updated = await this.service.complete(id);
      return BaseResponse.success(res, updated, "Appointment completed");
    } catch (err) {
      return next(err);
    }
  }

  async getMy(req, res, next) {
    try {
      const user = req.user;
      if (!user || String(user.role || "").toLowerCase() !== "student")
        throw BaseError.forbidden("Hanya student yang dapat mengakses data ini");

      const appt = await prisma.appointment.findFirst({
        where: {
          student_id: user.id,
          status: { in: ["PENDING", "CONFIRMED"] }
        },
        orderBy: { date: "desc" }
      });

      return BaseResponse.success(res, appt || null, "My appointment fetched");
    } catch (err) {
      next(err);
    }
  }

  async getActive(req, res, next) {
    try {
      const user = req.user;
      if (!user || String(user.role || "").toLowerCase() !== "student")
        throw BaseError.forbidden("Hanya student yang dapat mengakses data ini");

      const appt = await this.service.findActiveAppointment(user.id);
      return BaseResponse.success(res, appt || null, "Active appointment fetched");
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user || {};
      const role = String(user.role || "").toLowerCase();

      if (role !== "doctor") throw BaseError.forbidden("Hanya dokter yang dapat mengubah status");

      const appt = await this.service.findById(id);
      if (!appt) throw BaseError.notFound("Appointment tidak ditemukan");
      if (appt.doctor_id !== user.id) throw BaseError.forbidden("Akses ditolak");

      const allowedStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
      if (!allowedStatuses.includes(status.toUpperCase())) throw BaseError.badRequest("Status tidak valid");

      const updated = await this.service.updateStatus(id, status.toUpperCase());
      return BaseResponse.success(res, updated, `Appointment status updated to ${status.toUpperCase()}`);
    } catch (err) {
      return next(err);
    }
  }
}

export default new AppointmentController();
