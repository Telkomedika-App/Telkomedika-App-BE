import DoctorAuthService from "./doctor-auth.service.js";
import BaseController from "../../common/base_classes/base-controller.js";

class DoctorAuthController extends BaseController {
  constructor() {
    super(DoctorAuthService);
  }

  async list(req, res) {
    const data = await this.service.list();
    return this.response.success(res, data, "Doctors fetched");
  }

  async login(req, res) {
    const info = req.body;
    const data = await this.service.login(info);
    return this.response.success(res, data, "Login Successful");
  }

  async register(req, res) {
    const info = req.body;
    const data = await this.service.register(info);
    return this.response.created(res, data, "Registration Successful");
  }
}

export default new DoctorAuthController();
