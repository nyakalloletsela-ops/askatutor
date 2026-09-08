export type {
  AiGateway,
  AiChatOptions,
  AiChatResult,
  AiEmbedOptions,
  AiEmbedResult,
  AiMessage,
  AiContentPart,
  AiProviderTestResult,
  EmailService,
  SendEmailOptions,
  EmailFromAlias,
  PaymentGateway,
  CheckoutStartOptions,
  CheckoutStartResult,
  PaymentProvider,
  PaymentCurrency,
  PaymentCountry,
  EntitlementGateway,
  UserRole,
  AiScope,
  FeatureScope,
  PlatformConfigShape,
} from "./contracts";

export { aiTutorChat } from "./use-cases/ai/tutor-chat";
export { aiToolRun } from "./use-cases/ai/tool-run";
export { runAgent } from "./use-cases/ai/run-agent";
export { whiteboardConvert } from "./use-cases/whiteboard/convert";
export { simLabChat } from "./use-cases/simulation/chat";
export {
  SimulationSchema,
  embedPrompt,
  findSimilarSimulation,
  generateSimulationSchema,
  saveSimulation,
  listSimulations,
  deleteSimulation,
} from "./use-cases/simulation/lab";
export { notifyBookingEmails } from "./use-cases/communication/notifications";
export { sendMessage } from "./use-cases/communication/messaging";
export { getCourseMaterialUrl } from "./use-cases/courses/material-url";
export { listSchedulableStudents } from "./use-cases/students/list";
export { submitHelpMessage, sendSubscriptionDecisionEmail } from "./use-cases/support/help";
export {
  adminCreateUser,
  adminListUsers,
  adminDeleteUser,
} from "./use-cases/admin/user-management";
export {
  saveAiKey,
  getAiKeyStatus,
  testAiProvider,
} from "./use-cases/admin/ai-keys";
export { updatePlatformConfig } from "./use-cases/admin/config-management";
export {
  getAdminDashboardData,
  approveTutorApplication,
  rejectTutorApplication,
  logTutorDecision,
} from "./use-cases/admin/admin-dashboard";
export {
  loadWhiteboard,
  saveWhiteboard,
} from "./use-cases/classroom/whiteboard-persistence";
export {
  listClassroomFiles,
  getClassroomFileUrl,
  deleteClassroomFile,
} from "./use-cases/classroom/classroom-files";
export { sendClassroomMessage } from "./use-cases/classroom/classroom-chat";
export {
  getTutorProfile,
  getTutorAvailability,
  bookSession,
  joinWaitlist,
} from "./use-cases/discovery/book-session";
export {
  checkIsAdmin,
  getClassroomContext,
  getMyScopes,
} from "./use-cases/identity/check-access";
export { saveToNotes } from "./use-cases/learning/save-to-notes";
export { listNotes, createNote, deleteNote } from "./use-cases/learning/notes";
export {
  cancelSession,
  rescheduleSession,
  completeSession,
  getLessonsList,
} from "./use-cases/sessions/manage-session";
export { createForumPost } from "./use-cases/trust-safety/moderation";
