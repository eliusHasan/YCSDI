import { Request, Response } from 'express';
import { Student } from '../models/Student.js';

export class RegistrationController {
  static async registerStudent(req: Request, res: Response) {
    try {
      const studentData = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Passport size photo is required' });
      }

      // Generate a unique registration ID (e.g., YCSDI-2024-XXXX)
      const count = await Student.countDocuments();
      const year = new Date().getFullYear();
      const registrationId = `YCSDI-${year}-${(count + 1).toString().padStart(4, '0')}`;

      const newStudent = new Student({
        ...studentData,
        photoUrl: file.path, // Cloudinary URL from multer-storage-cloudinary
        registrationId,
        status: 'pending'
      });

      await newStudent.save();

      res.status(201).json({
        message: 'Registration successful! Your application is pending review.',
        registrationId,
        student: newStudent
      });
    } catch (error: any) {
      console.error('Registration Error:', error);
      res.status(500).json({ 
        message: 'Failed to register student', 
        error: error.message 
      });
    }
  }

  // Admin method to approve and set credentials
  static async approveStudent(req: Request, res: Response) {
    // This will be implemented when admin dashboard is set up
    // Logic: Create User, link to Student, update Student status to 'approved'
  }
}
