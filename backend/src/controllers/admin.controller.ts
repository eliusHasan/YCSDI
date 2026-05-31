import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';

export class AdminController {
  static async getAllStudents(req: Request, res: Response) {
    try {
      const students = await Student.find().sort({ createdAt: -1 });
      res.status(200).json(students);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
  }

  static async approveStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { userId, password } = req.body;

      if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and Password are required' });
      }

      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Check if userId is already taken
      const existingUser = await User.findOne({ userId });
      if (existingUser) {
        return res.status(400).json({ message: 'User ID already exists' });
      }

      // Create User record
      const newUser = new User({
        userId,
        password,
        role: 'student',
        refId: student._id
      });

      await newUser.save();

      // Update Student status and link to User
      student.status = 'approved';
      student.userId = newUser._id as any;
      await student.save();

      res.status(200).json({ 
        message: 'Student approved successfully!', 
        student,
        user: { userId: newUser.userId, role: newUser.role }
      });
    } catch (error: any) {
      console.error('Approval Error:', error);
      res.status(500).json({ message: 'Failed to approve student', error: error.message });
    }
  }

  static async rejectStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      student.status = 'rejected';
      await student.save();

      res.status(200).json({ message: 'Student application rejected' });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to reject student', error: error.message });
    }
  }
}
