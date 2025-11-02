import SkibidiService from "./skibidi.service.js";
import BaseController from "../../common/base_classes/base-controller.js";

class SkibidiController extends BaseController {
  constructor() {
    super(SkibidiService);
    // this.error = BaseError
    // this.response = BaseResponse
    // this.service = SkibidiService
  }

  async someMethod(req, res) {
    // implement method logic here
  }
}

export default new SkibidiController();
