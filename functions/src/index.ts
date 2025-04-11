import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

// Function to send email notifications
export const sendEmailNotification = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { to, subject, text, html } = data;

    const mailOptions = {
      from: functions.config().email.user,
      to,
      subject,
      text,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError("internal", "Error sending email");
    }
  }
);

// Function to send event notifications
export const sendEventNotification = functions.firestore
  .document("events/{eventId}")
  .onCreate(async (snap, context) => {
    const event = snap.data();
    const eventId = context.params.eventId;

    // Get all users who should be notified
    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .where("notificationsEnabled", "==", true)
      .get();

    const emailPromises = usersSnapshot.docs.map(async (userDoc) => {
      const user = userDoc.data();
      const mailOptions = {
        from: functions.config().email.user,
        to: user.email,
        subject: `New Event: ${event.title}`,
        html: `
          <h1>New Event Created</h1>
          <p>A new event "${event.title}" has been created.</p>
          <p>Description: ${event.description}</p>
          <p>Date: ${event.date}</p>
          <p>Location: ${event.location}</p>
          <a href="${
            functions.config().app.url
          }/events/${eventId}">View Event</a>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    try {
      await Promise.all(emailPromises);
      console.log("Event notifications sent successfully");
    } catch (error) {
      console.error("Error sending event notifications:", error);
    }
  });

// Function to send task assignment notifications
export const sendTaskAssignmentNotification = functions.firestore
  .document("tasks/{taskId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const taskId = context.params.taskId;

    // Only send notification if the task was just assigned
    if (
      newData.assignedTo &&
      (!previousData.assignedTo ||
        previousData.assignedTo !== newData.assignedTo)
    ) {
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(newData.assignedTo)
        .get();

      if (userDoc.exists && userDoc.data()?.notificationsEnabled) {
        const user = userDoc.data();
        const mailOptions = {
          from: functions.config().email.user,
          to: user.email,
          subject: `New Task Assigned: ${newData.title}`,
          html: `
            <h1>New Task Assigned</h1>
            <p>You have been assigned a new task: "${newData.title}"</p>
            <p>Description: ${newData.description}</p>
            <p>Due Date: ${newData.dueDate}</p>
            <a href="${
              functions.config().app.url
            }/tasks/${taskId}">View Task</a>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log("Task assignment notification sent successfully");
        } catch (error) {
          console.error("Error sending task assignment notification:", error);
        }
      }
    }
  });
