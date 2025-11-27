import BaseService from "../../common/base_classes/base-service.js";

class AppointmentService extends BaseService {
  constructor() {
    super();
    // this.error = BaseError
    // this.db = Prisma
  }

  async getAllDoctors() {
    const doctors = await this.db.doctor.findMany({
      orderBy: { created_at: "desc" }
    });
    return doctors;
  }
  
  async getAllStudentAppointments(student) {
    const appointments = await this.db.appointment.findMany({
      where: { student_id: student },
      include: { doctor: true },
      orderBy: { created_at: "desc" }
    });
    return appointments;
  }

  async getAllDoctorAppointments(doctor) {
    const appointments = await this.db.appointment.findMany({
      where: { doctor_id: doctor },
      include: { student: true },
      orderBy: { created_at: "desc" }
    });
    return appointments;
  }

  async getStudentAppointmentById(id, student) {
    const appointment = await this.db.appointment.findFirst({
      where: { id, student_id: student },
      include: { doctor: true },
    });
    return appointment;
  }

  async getDoctorAppointmentById(id, doctor) {
    const appointment = await this.db.appointment.findFirst({
      where: { id, doctor_id: doctor },
      include: { student: true },
    });
    return appointment;
  }

  async createAppointment(info, student) {
    const { doctor_id, date } = info

    const created = await this.db.appointment.create({
      data: {
        student_id: student,
        doctor_id,
        date
      },
      include: { doctor: true }
    });

    return created;
  }

  async updateAppointmentStatus(id, info, doctor) {
    const { status } = info;

    const appointment = await this.db.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw this.error.notFound("Appointment not found");
    }

    const updated = await this.db.appointment.update({
      where: { id },
      data: { status },
    });

    return updated;
  }

  async cancelAppointment(id, student) {
    const appointment = await this.db.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw this.error.notFound("Appointment not found");
    }

    const canceled = await this.db.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return canceled;
  }

  async deleteAppointment(id) {
    const appointment = await this.db.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw this.error.notFound("Appointment not found");
    }

    await this.db.appointment.delete({
      where: { id },
    });

    return { id };
  }
}

export default new AppointmentService();
