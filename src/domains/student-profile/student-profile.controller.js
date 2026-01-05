import StudentProfileService from "./student-profile.service.js";
import BaseController from "../../common/base_classes/base-controller.js";

class StudentProfileController extends BaseController {
  constructor() {
    super(StudentProfileService);
    // this.error = BaseError
    // this.response = BaseResponse
    // this.service = StudentProfileService
  }

  async getProfile(req, res) {
    const id = req.user.id;
    const data = await this.service.getProfile(id);
    return this.response.success(res, data, "Profile retrieved successfully");
  }

  async updateProfile(req, res) {
    const id = req.user.id;
    const info = req.body;
    const data = await this.service.updateProfile(id, info);
    return this.response.success(res, data, "Profile updated successfully");
  }
}

export default new StudentProfileController();