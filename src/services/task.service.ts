import { getRepository, Between, Like } from "typeorm";
import { Task, TaskStatus, TaskPriority } from "../entities/Task";
import { User } from "../entities/User";
import { Event } from "../entities/Event";

export class TaskService {
  private taskRepository = getRepository(Task);
  private userRepository = getRepository(User);
  private eventRepository = getRepository(Event);

  async createTask(taskData: Partial<Task>, creatorId: string) {
    // Validate assigned user if provided
    if (taskData.assignedTo) {
      const user = await this.userRepository.findOne({
        where: { id: taskData.assignedTo.id },
      });
      if (!user) {
        throw new Error("Assigned user not found");
      }
    }

    // Validate event if provided
    if (taskData.event) {
      const event = await this.eventRepository.findOne({
        where: { id: taskData.event.id },
      });
      if (!event) {
        throw new Error("Event not found");
      }
    }

    const task = this.taskRepository.create({
      ...taskData,
      status: TaskStatus.PENDING,
    });

    return await this.taskRepository.save(task);
  }

  async getTaskById(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["assignedTo", "event"],
    });

    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  }

  async getAllTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    eventId?: string;
    dueDate?: Date;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedTo) {
      where.assignedTo = { id: filters.assignedTo };
    }

    if (filters?.eventId) {
      where.event = { id: filters.eventId };
    }

    if (filters?.dueDate) {
      where.dueDate = Between(new Date(), filters.dueDate);
    }

    if (filters?.search) {
      where.title = Like(`%${filters.search}%`);
    }

    return await this.taskRepository.find({
      where,
      relations: ["assignedTo", "event"],
      order: { dueDate: "ASC" },
    });
  }

  async updateTask(id: string, taskData: Partial<Task>) {
    const task = await this.getTaskById(id);

    // Validate assigned user if provided
    if (taskData.assignedTo) {
      const user = await this.userRepository.findOne({
        where: { id: taskData.assignedTo.id },
      });
      if (!user) {
        throw new Error("Assigned user not found");
      }
    }

    // Validate event if provided
    if (taskData.event) {
      const event = await this.eventRepository.findOne({
        where: { id: taskData.event.id },
      });
      if (!event) {
        throw new Error("Event not found");
      }
    }

    Object.assign(task, taskData);

    return await this.taskRepository.save(task);
  }

  async deleteTask(id: string) {
    const task = await this.getTaskById(id);

    await this.taskRepository.remove(task);

    return { message: "Task deleted successfully" };
  }

  async assignTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    task.assignedTo = user;

    return await this.taskRepository.save(task);
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const task = await this.getTaskById(taskId);

    task.status = status;

    return await this.taskRepository.save(task);
  }
}
