console.log(">>> SERVICE FILE LOADED <<<");

import prisma from "../../common/services/prisma.service.js";

// combine date + time
function combineDateAndTime(dateInput, timeStr) {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  if (!timeStr) return date;

  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

class AppointmentService {
  async create(data) {
    const dateTime = combineDateAndTime(data.date, data.time);
    if (!dateTime) throw new Error("Invalid date/time");

    return prisma.appointment.create({
      data: {
        student_id: data.student_id,
        doctor_id: data.doctor_id,
        fullName: data.fullName,
        phone: data.phone,
        date: dateTime,
        time: data.time,
        service: data.service,
        role: data.role || "student",
        status: data.status || "PENDING"
      }
    });
  }

  findByStudentId(studentId) {
    return prisma.appointment.findMany({
      where: { student_id: studentId },
      orderBy: { date: "desc" },
      include: { student: true, doctor: true }
    });
  }

  findByDoctorId(doctorId) {
    return prisma.appointment.findMany({
      where: { doctor_id: doctorId },
      orderBy: { date: "desc" },
      include: { student: true, doctor: true }
    });
  }

  findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { student: true, doctor: true }
    });
  }

  findAll() {
    return prisma.appointment.findMany({
      orderBy: { date: "desc" },
      include: { student: true, doctor: true }
    });
  }

  findActiveAppointment(studentId) {
  return prisma.appointment.findFirst({
    where: {
      student_id: studentId,
      status: {
        in: ["PENDING", "CONFIRMED"]
      }
    },
    orderBy: { date: "desc" }
  });
}

// di AppointmentService.js
updateStatus(id, status) {
  return prisma.appointment.update({
    where: { id },
    data: { status: status.toUpperCase() },
  });
}


  cancel(id) {
    return prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" }
    });
  }

  confirm(id) {
    return prisma.appointment.update({
      where: { id },
      data: { status: "CONFIRMED" }
    });
  }

  complete(id) {
    return prisma.appointment.update({
      where: { id },
      data: { status: "COMPLETED" }
    });
  }
}

// ✅ INI BAGIAN PALING PENTING
export default new AppointmentService();
