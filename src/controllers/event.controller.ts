import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { EventStatus } from "../entities/Event";

export class EventController {
  private eventService = new EventService();

  async createEvent(req: AuthRequest, res: Response) {
    try {
      const eventData = req.body;

      // Validate required fields
      if (!eventData.title || !eventData.startDate || !eventData.endDate) {
        return res
          .status(400)
          .json({ message: "Title, start date, and end date are required" });
      }

      // Validate dates
      const startDate = new Date(eventData.startDate);
      const endDate = new Date(eventData.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (startDate >= endDate) {
        return res
          .status(400)
          .json({ message: "End date must be after start date" });
      }

      const event = await this.eventService.createEvent(
        eventData,
        req.user!.id
      );

      return res.status(201).json(event);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const event = await this.eventService.getEventById(id);

      return res.status(200).json(event);
    } catch (error) {
      if (error.message === "Event not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllEvents(req: Request, res: Response) {
    try {
      const { status, startDate, endDate, search } = req.query;

      const filters: any = {};

      if (
        status &&
        Object.values(EventStatus).includes(status as EventStatus)
      ) {
        filters.status = status;
      }

      if (startDate && endDate) {
        filters.startDate = new Date(startDate as string);
        filters.endDate = new Date(endDate as string);
      }

      if (search) {
        filters.search = search;
      }

      const events = await this.eventService.getAllEvents(filters);

      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const eventData = req.body;

      // Validate dates if provided
      if (eventData.startDate && eventData.endDate) {
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        if (startDate >= endDate) {
          return res
            .status(400)
            .json({ message: "End date must be after start date" });
        }
      }

      const event = await this.eventService.updateEvent(id, eventData);

      return res.status(200).json(event);
    } catch (error) {
      if (error.message === "Event not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await this.eventService.deleteEvent(id);

      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "Event not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async addParticipant(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const event = await this.eventService.addParticipant(eventId, userId);

      return res.status(200).json(event);
    } catch (error) {
      if (
        error.message === "Event not found" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "User is already a participant") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async removeParticipant(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const event = await this.eventService.removeParticipant(eventId, userId);

      return res.status(200).json(event);
    } catch (error) {
      if (error.message === "Event not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
