import { getRepository, Between, Like } from "typeorm";
import { Event, EventStatus } from "../entities/Event";
import { User } from "../entities/User";

export class EventService {
  private eventRepository = getRepository(Event);
  private userRepository = getRepository(User);

  async createEvent(eventData: Partial<Event>, creatorId: string) {
    const event = this.eventRepository.create({
      ...eventData,
      status: EventStatus.UPCOMING,
    });

    return await this.eventRepository.save(event);
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ["participants"],
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  }

  async getAllEvents(filters?: {
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate && filters?.endDate) {
      where.startDate = Between(filters.startDate, filters.endDate);
    }

    if (filters?.search) {
      where.title = Like(`%${filters.search}%`);
    }

    return await this.eventRepository.find({
      where,
      relations: ["participants"],
      order: { startDate: "ASC" },
    });
  }

  async updateEvent(id: string, eventData: Partial<Event>) {
    const event = await this.getEventById(id);

    Object.assign(event, eventData);

    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: string) {
    const event = await this.getEventById(id);

    await this.eventRepository.remove(event);

    return { message: "Event deleted successfully" };
  }

  async addParticipant(eventId: string, userId: string) {
    const event = await this.getEventById(eventId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    if (event.participants.some((p) => p.id === userId)) {
      throw new Error("User is already a participant");
    }

    event.participants.push(user);

    return await this.eventRepository.save(event);
  }

  async removeParticipant(eventId: string, userId: string) {
    const event = await this.getEventById(eventId);

    event.participants = event.participants.filter((p) => p.id !== userId);

    return await this.eventRepository.save(event);
  }
}
