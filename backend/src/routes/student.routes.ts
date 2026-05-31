import { Router } from 'express';
import { RegistrationController } from '../controllers/registration.controller.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.post('/register', upload.single('photo'), RegistrationController.registerStudent);

export { router as studentRoutes };
