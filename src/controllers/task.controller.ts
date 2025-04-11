import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { TaskStatus, TaskPriority } from '../entities/Task';

export class TaskController {
  private taskService = new TaskService();

  async createTask(req: AuthRequest, res: Response) {
    try {
      const taskData = req.body;
      
      // Validate required fields
      if (!taskData.title || !taskData.dueDate) {
        return res.status(400).json({ message: 'Title and due date are required' });
      }
      
      // Validate due date
      const dueDate = new Date(taskData.dueDate);
      
      if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      const task = await this.taskService.createTask(taskData, req.user!.id);
      
      return res.status(201).json(task);
    } catch (error) {
      if (error.message === 'Assigned user not found' || error.message === 'Event not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const task = await this.taskService.getTaskById(id);
      
      return res.status(200).json(task);
    } catch (error) {
      if (error.message === 'Task not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAllTasks(req: Request, res: Response) {
    try {
      const { status, priority, assignedTo, eventId, dueDate, search } = req.query;
      
      const filters: any = {};
      
      if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
        filters.status = status;
      }
      
      if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
        filters.priority = priority;
      }
      
      if (assignedTo) {
        filters.assignedTo = assignedTo;
      }
      
      if (eventId) {
        filters.eventId = eventId;
      }
      
      if (dueDate) {
        filters.dueDate = new Date(dueDate as string);
      }
      
      if (search) {
        filters.search = search;
      }
      
      const tasks = await this.taskService.getAllTasks(filters);
      
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const taskData = req.body;
      
      // Validate due date if provided
      if (taskData.dueDate) {
        const dueDate = new Date(taskData.dueDate);
        
        if (isNaN(dueDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
      }
      
      const task = await this.taskService.updateTask(id, taskData);
      
      return res.status(200).json(task);
    } catch (error) {
      if (error.message === 'Task not found' || error.message === 'Assigned user not found' || error.message === 'Event not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await this.taskService.deleteTask(id);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Task not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async assignTask(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const task = await this.taskService.assignTask(taskId, userId);
      
      return res.status(200).json(task);
    } catch (error) {
      if (error.message === 'Task not found' || error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }

  async updateTaskStatus(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      
      if (!status || !Object.values(TaskStatus).includes(status)) {
        return res.status(400).json({ message: 'Valid status is required' });
      }
      
      const task = await this.taskService.updateTaskStatus(taskId, status);
      
      return res.status(200).json(task);
    } catch (error) {
      if (error.message === 'Task not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 