/**
 * AppDependencies — the composition-root contract the Application reads from
 * context. Every Application use case consumes repositories/gateways through
 * this interface; the Infrastructure layer builds an implementation per
 * request inside the `withAppDependencies` middleware.
 */
import type { AiGateway } from "./ai";
import type { EmailService } from "./email";
import type { PaymentGateway } from "./payments";
import type { EntitlementGateway } from "./entitlements";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { SessionRepository } from "@/domain/ports/session-repository";
import type { TutorRepository } from "@/domain/ports/tutor-repository";
import type { CourseMaterialRepository } from "@/domain/ports/course-material-repository";
import type { ClassroomRepository } from "@/domain/ports/classroom-repository";
import type { MessageRepository } from "@/domain/ports/message-repository";
import type { NoteRepository } from "@/domain/ports/note-repository";
import type { SimulationRepository } from "@/domain/ports/simulation-repository";
import type { ModerationRepository } from "@/domain/ports/moderation-repository";
import type { HelpRepository } from "@/domain/ports/help-repository";
import type { PlatformConfigRepository } from "@/domain/ports/platform-config-repository";
import type { AiKeyRepository } from "@/domain/ports/ai-key-repository";
import type { AdminRepository } from "@/domain/ports/admin-repository";
import type { EmailSuppressionRepository } from "@/domain/ports/email-suppression-repository";

export interface AppDependencies {
  user: UserRepository;
  session: SessionRepository;
  tutor: TutorRepository;
  courseMaterial: CourseMaterialRepository;
  classroom: ClassroomRepository;
  message: MessageRepository;
  note: NoteRepository;
  simulation: SimulationRepository;
  moderation: ModerationRepository;
  help: HelpRepository;
  platformConfig: PlatformConfigRepository;
  aiKey: AiKeyRepository;
  admin: AdminRepository;
  emailSuppression: EmailSuppressionRepository;
  aiGateway: AiGateway;
  emailService: EmailService;
  paymentGateway: PaymentGateway;
  entitlement: EntitlementGateway;
}