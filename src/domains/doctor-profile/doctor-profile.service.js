// doctor-profile.service.js
import BaseService from "../../common/base_classes/base-service.js";
import {
  hashPassword,
  matchPassword,
} from "../../utils/auth.util.js";

class DoctorProfileService extends BaseService {
  constructor() {
    super();
    // this.error = BaseError
    // this.db = Prisma
  }
  
  async getProfile(id) {
    const doctor = await this.db.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!doctor) {
      throw this.error.notFound("Doctor not found");
    }

    return doctor;
  }

  async updateProfile(id, data) {
    if (!data) {
      throw this.error.badRequest("No data provided");
    }

    const doctor = await this.db.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw this.error.notFound("Doctor not found");
    }

    // Check if email is being changed and if it already exists
    const email = data?.email?.trim();
    if (email && email !== doctor.email) {
      const existingDoctor = await this.db.doctor.findUnique({
        where: { email },
      });

      if (existingDoctor) {
        throw this.error.unprocessable("Email already in use");
      }
    }

    // Validate password change
    const password = data?.password?.trim();
    if (password) {
      const oldPassword = data?.old_password?.trim();
      
      // Old password is required when changing password
      if (!oldPassword) {
        throw this.error.badRequest("Old password is required to change password");
      }

      // Verify old password
      const isOldPasswordValid = await matchPassword(oldPassword, doctor.password);
      if (!isOldPasswordValid) {
        throw this.error.unauthorized("Old password is incorrect");
      }

      // Password confirmation is required
      const passwordConfirmation = data?.password_confirmation?.trim();
      if (!passwordConfirmation) {
        throw this.error.badRequest("Password confirmation is required");
      }

      // New password and confirmation must match
      if (password !== passwordConfirmation) {
        throw this.error.badRequest("Password and password confirmation do not match");
      }

      // Check if new password is the same as current password
      const isSameAsCurrentPassword = await matchPassword(password, doctor.password);
      if (isSameAsCurrentPassword) {
        throw this.error.badRequest("New password cannot be the same as your current password");
      }
    }

    // Update only provided fields
    const updateData = {};
    const name = data?.name?.trim();
    if (name) updateData.name = name;
    
    if (email) updateData.email = email;
    
    const phone = data?.phone?.trim();
    if (phone) updateData.phone = phone;
    
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    // Check if any updates were made
    if (Object.keys(updateData).length === 0) {
      throw this.error.badRequest("No valid data provided to update");
    }

    const updatedDoctor = await this.db.doctor.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        updated_at: true,
      },
    });

    return updatedDoctor;
  }
}

export default new DoctorProfileService();