import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Student } from '../models/Student';
import { Faculty } from '../models/Faculty';
import { Notice } from '../models/Notice';
import { Timetable } from '../models/Timetable';
import { Assignment } from '../models/Assignment';
import { Attendance } from '../models/Attendance';
import { Result } from '../models/Result';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { applyQueryParams } from '../utils/queryHelper';

const getModel = (table: string) => {
  switch (table.toLowerCase()) {
    case 'students': return Student;
    case 'faculty': return Faculty;
    case 'notices': return Notice;
    case 'timetable': return Timetable;
    case 'assignments': return Assignment;
    case 'attendance': return Attendance;
    case 'results': return Result;
    case 'profiles': return User;
    default: return null;
  }
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { table } = req.params;
    const Model = getModel(table);
    if (!Model) {
      return res.status(404).json({ message: `Table '${table}' not found` });
    }

    const baseQuery = (Model as any).find();
    const query = applyQueryParams(baseQuery, req.query);
    const data = await query.exec();

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving records', error: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { table, id } = req.params;
    const Model = getModel(table);
    if (!Model) {
      return res.status(404).json({ message: `Table '${table}' not found` });
    }

    const item = await (Model as any).findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving record', error: error.message });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { table } = req.params;
    const Model = getModel(table);
    if (!Model) {
      return res.status(404).json({ message: `Table '${table}' not found` });
    }

    const itemData = { ...req.body };

    // Auto-fill author fields based on logged-in user if available
    if (req.user) {
      if (table === 'notices') {
        itemData.published_by = req.user.id;
      } else if (table === 'attendance') {
        itemData.marked_by = req.user.id;
      } else if (table === 'results') {
        itemData.entered_by = req.user.id;
      }
    }

    // Auto-create login user account if creating Student or Faculty record
    if (table === 'students') {
      const { email, name } = itemData;
      if (email) {
        let user = await User.findOne({ email });
        if (!user) {
          const hashedPassword = await bcrypt.hash('student123', 10);
          user = new User({
            email,
            password: hashedPassword,
            role: 'student',
            full_name: name || '',
            department: itemData.department || '',
          });
          await user.save();
        }
        itemData.user_id = user._id;
      }
    } else if (table === 'faculty') {
      const { email, name } = itemData;
      if (email) {
        let user = await User.findOne({ email });
        if (!user) {
          const hashedPassword = await bcrypt.hash('faculty123', 10);
          user = new User({
            email,
            password: hashedPassword,
            role: 'faculty',
            full_name: name || '',
            department: itemData.department || '',
          });
          await user.save();
        }
        itemData.user_id = user._id;
      }
    }

    const newItem = new (Model as any)(itemData);
    await newItem.save();

    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating record', error: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { table, id } = req.params;
    const Model = getModel(table);
    if (!Model) {
      return res.status(404).json({ message: `Table '${table}' not found` });
    }

    const updatedItem = await (Model as any).findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Sync changes to User collection if Student or Faculty name/email/department is updated
    if (table === 'students' || table === 'faculty') {
      const item = updatedItem as any;
      if (item.user_id && (req.body.name || req.body.email || req.body.department)) {
        const updateFields: any = {};
        if (req.body.name) updateFields.full_name = req.body.name;
        if (req.body.email) updateFields.email = req.body.email;
        if (req.body.department) updateFields.department = req.body.department;
        await User.findByIdAndUpdate(item.user_id, updateFields);
      }
    }

    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating record', error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { table, id } = req.params;
    const Model = getModel(table);
    if (!Model) {
      return res.status(404).json({ message: `Table '${table}' not found` });
    }

    const deletedItem = await (Model as any).findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // If student or faculty record is deleted, delete the user login too
    if (table === 'students' || table === 'faculty') {
      const item = deletedItem as any;
      if (item.user_id) {
        await User.findByIdAndDelete(item.user_id);
      }
    }

    res.json({ message: 'Record deleted successfully', data: deletedItem });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting record', error: error.message });
  }
};
