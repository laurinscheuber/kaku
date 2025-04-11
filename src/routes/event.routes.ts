import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import {
  verifyFirebaseToken,
  authorizeRole,
} from "../middlewares/firebase-auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();
const eventController = new EventController();

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

// Protected routes (authenticated users)
router.post("/", verifyFirebaseToken, eventController.createEvent);
router.put("/:id", verifyFirebaseToken, eventController.updateEvent);
router.delete("/:id", verifyFirebaseToken, eventController.deleteEvent);

// Participant management
router.post(
  "/:eventId/participants",
  verifyFirebaseToken,
  eventController.addParticipant
);
router.delete(
  "/:eventId/participants",
  verifyFirebaseToken,
  eventController.removeParticipant
);

// Admin only routes
router.get(
  "/admin/all",
  verifyFirebaseToken,
  authorizeRole([UserRole.ADMIN]),
  eventController.getAllEvents
);

export default router;
