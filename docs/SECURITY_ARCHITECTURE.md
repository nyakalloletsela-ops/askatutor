# ASKATUTORLIVE — SECURITY ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

Security is a cross-cutting concern that affects all layers and domains. This document defines trust boundaries, authentication, authorization, and security controls.

---

## 2. AUTHENTICATION

| Aspect | Approach |
|--------|----------|
| Method | Email/password + optional OAuth |
| Session Management | Server-side sessions with secure tokens |
| Token Type | JWT or opaque tokens (REQUIRES DECISION) |
| MFA | Optional, recommended for tutors and admins |
| Password Policy | Minimum length, hashing with bcrypt/argon2 |
| Session Expiry | Configurable per role |

**Implementation Phase**: Phase 1 (Identity foundation)

---

## 3. AUTHORIZATION — ROLE MODEL

| Role | Scope | Capabilities |
|------|-------|-------------|
| LEARNER | Own data, own sessions | Learn, use whiteboard, request tutor, save labs, manage profile |
| TUTOR | Assigned sessions | View learner briefing, conduct sessions, confirm interpretations, manage profile |
| PARENT | Linked learners (with consent) | View progress summaries, facilitate payments |
| INSTITUTION_ADMIN | Institution scope | Manage classes, generate links, view reports |
| ADMIN | Platform-wide (with auth) | User management, moderation, system health, audit |
| ANONYMOUS (institution-link) | Session-scoped | Participate in assigned session only |

---

## 4. AUTHORIZATION — PERMISSION MODEL

### 4.1 Resource-Based Permissions

| Resource | Owner | Tutor | Parent | Institution | Admin |
|----------|-------|-------|--------|-------------|-------|
| Learner Profile | Full | Read (session) | Read (consent) | None | Full |
| Learning Session | Full | Read/Write (assigned) | None | Read (institution) | Full |
| Whiteboard | Full | Read/Write (session) | None | Read (institution) | Full |
| Evidence | Full | Read (session) | Read (consent) | Read (institution) | Full |
| AI Interaction | Full | Read (session) | None | None | Read (audit) |
| Lab Record | Full | Read (session) | None | None | Full |
| Community Post | Full | Full | None | None | Full |
| Payment Data | Full | None | Read | None | Full |
| Institution Data | None | None | None | Full | Full |

### 4.2 Action-Based Permissions

| Action | Required Role | Additional Check |
|--------|--------------|-----------------|
| Create Account | Public | None |
| Login | Public | Valid credentials |
| Start Learning Session | Learner | Active subscription/entitlement |
| Request Tutor | Learner | Active subscription/entitlement |
| Conduct Tutor Session | Tutor | Assigned to session |
| Confirm AI Interpretation | Tutor | Assigned to session |
| Save Lab | Learner | Entitlement check |
| Share Lab | Learner | Lab ownership + safety rules |
| Create Forum Post | Learner/Tutor | None |
| Moderate Content | Admin | Authorization check |
| Process Payment | System | Server-authoritative |
| Generate Institution Link | Institution Admin | Institution ownership |
| View Audit Log | Admin | Authorization check |

---

## 5. LEARNER ISOLATION

- Learner data is isolated by account ID
- Queries must always filter by the authenticated user's ID
- Tutor access is limited to assigned sessions
- Parent access requires explicit learner consent
- Institution access is limited to institution-scoped data
- No cross-learner data leakage permitted

---

## 6. AI DATA BOUNDARY

- AI receives only information permitted by the current trust boundary
- AI must not access data outside the current session context
- AI-generated output is tagged as AI-generated
- AI interpretation is not treated as verified evidence
- AI provider communication is encrypted in transit
- AI request/response logs are audit-trail protected

---

## 7. PAYMENT SECURITY

- Payment processing is server-authoritative
- Never trust client-supplied financial values
- Payment provider (e.g., Stripe) handles card data
- Platform stores only tokens/references, not card numbers
- All payment transactions are idempotent
- Payment records are immutable
- Reconciliation processes verify payment integrity

---

## 8. IDOR PREVENTION

- All resource access checks verify ownership or authorization
- API endpoints validate that the authenticated user has access to the requested resource
- Institution links are scoped to the institution context
- Session tokens are validated on every request
- Resource IDs are not predictable (use UUIDs)

---

## 9. PRIVILEGE ESCALATION PREVENTION

- Role checks are performed server-side on every request
- Client cannot override role or permission
- Admin actions require admin role verification
- Tutor actions require session assignment verification
- Institution actions require institution ownership verification

---

## 10. RATE LIMITING

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 attempts | 15 minutes |
| API (authenticated) | 100 requests | 1 minute |
| AI Gateway | Per plan limits | Per billing cycle |
| File Upload | Per plan limits | Per billing cycle |
| Password Reset | 3 attempts | 1 hour |

---

## 11. SECRET MANAGEMENT

- Environment variables for all secrets
- Never commit secrets to repository
- API keys stored in environment variables
- Database credentials in environment variables
- Payment provider keys in environment variables
- AI provider keys in environment variables

---

## 12. DATA MINIMIZATION

- Collect only data necessary for functionality
- AI receives only context needed for current interaction
- Tutor receives only information needed for assigned session
- Parent receives only progress summaries (with consent)
- Institution receives only institution-scoped data
- Audit logs record access, not content (unless required)

---

## 13. CONTENT SECURITY

- User-generated content is sanitized
- File uploads are validated (type, size)
- Community content is moderated
- AI-generated content is reviewed before becoming reusable
- External simulation embeds are sandboxed

---

## 14. TRANSPORT SECURITY

- HTTPS required for all connections
- WebSocket connections use WSS
- API communication encrypted in transit
- AI provider communication encrypted in transit

---

## 15. AUDIT LOGGING

| Event Type | Logged |
|------------|--------|
| Authentication events | Yes |
| Authorization failures | Yes |
| Resource access (sensitive) | Yes |
| Payment transactions | Yes |
| Admin actions | Yes |
| AI interactions | Yes |
| Content moderation | Yes |
| Data exports | Yes |

---

## 16. ABUSE PREVENTION

- Content moderation on community features
- Rate limiting on all endpoints
- Account suspension capability
- Report system for abusive content
- Automatic detection of suspicious patterns
- Institution link abuse monitoring

---

## 17. SECURITY PHASES

| Phase | Security Deliverable |
|-------|---------------------|
| Phase 1 | Auth foundation, role model, basic session management |
| Phase 2 | Learner isolation, resource authorization |
| Phase 3 | Evidence access control, file upload security |
| Phase 4 | Tutor access control, session security |
| Phase 5 | AI gateway security, data boundary |
| Phase 8 | Institution link security |
| Phase 9 | Payment security, financial audit |
| Phase 10 | Admin security, audit logging |
| Phase 11 | Community moderation, abuse prevention |
