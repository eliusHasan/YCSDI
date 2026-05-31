import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';

const router = Router();

router.get('/students', AdminController.getAllStudents);
router.post('/students/:studentId/approve', AdminController.approveStudent);
router.post('/students/:studentId/reject', AdminController.rejectStudent);

export { router as adminRoutes };
