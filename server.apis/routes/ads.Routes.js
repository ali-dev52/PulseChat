
import express from 'express'
const adsRoute = express.Router()

import * as ads from "../controllers/adsController.js";
// import { requriedLoggedIn } from "../middlewares/authMiddleware.js";

// upload image
adsRoute.post("/upload-image", ads.uploadImage);

// delete image
adsRoute.post("/delete-image", ads.deleteImage);

// upload audio
adsRoute.post("/upload-audio", ads.uploadAudio);

export default adsRoute