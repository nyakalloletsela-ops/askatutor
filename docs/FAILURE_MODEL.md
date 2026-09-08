# ASKATUTORLIVE — FAILURE MODEL

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

This document identifies failure modes for each major subsystem, their causes, impacts, detection, mitigation, and recovery.

---

## 2. AI FAILURES

### 2.1 AI Provider Unavailable

| Aspect | Detail |
|--------|--------|
| Cause | Provider outage, rate limiting, network failure |
| Impact | AI features unavailable, learning interrupted |
| Detection | Health check, error response monitoring |
| Mitigation | Fallback to alternative provider, queue requests |
| Recovery | Auto-retry with exponential backoff |
| UX | Graceful degradation message, continue without AI |
| Data | No data loss |
| Security | No security impact |

### 2.2 AI Produces Invalid Output

| Aspect | Detail |
|--------|--------|
| Cause | Model hallucination, malformed response, schema violation |
| Impact | Incorrect guidance, potential confusion |
| Detection | Output validation against schema |
| Mitigation | Reject invalid output, retry with stricter prompt |
| Recovery | Request regenerated output |
| UX | "AI couldn't generate a response, trying again..." |
| Data | Invalid output logged, not persisted as evidence |
| Security | AI output not treated as authority |

### 2.3 AI Misunderstands Learner

| Aspect | Detail |
|--------|--------|
| Cause | Ambiguous input, context limitation, model limitation |
| Impact | Irrelevant or incorrect probing |
| Detection | Learner feedback, tutor review |
| Mitigation | Learner can redirect, tutor can correct |
| Recovery | Re-engage with different approach |
| UX | Learner can say "that's not what I mean" |
| Data | Misunderstanding logged for improvement |
| Security | No security impact |

### 2.4 AI Cost Exceeded

| Aspect | Detail |
|--------|--------|
| Cause | High usage, expensive model, runaway requests |
| Impact | AI features suspended |
| Detection | Cost monitoring, budget alerts |
| Mitigation | Switch to cheaper model, enforce quotas |
| Recovery | New billing period, manual reset |
| UX | "AI usage limit reached. Upgrade for more." |
| Data | Cost records maintained |
| Security | No security impact |

---

## 3. TUTOR FAILURES

### 3.1 Tutor Unavailable

| Aspect | Detail |
|--------|--------|
| Cause | No tutors online, tutor cancellation, network issue |
| Impact | Learner cannot get human help |
| Detection | Availability check, timeout |
| Mitigation | Queue request, notify when available |
| Recovery | Tutor becomes available, assignment |
| UX | "No tutors available right now. We'll notify you." |
| Data | Request logged |
| Security | No security impact |

### 3.2 Tutor Session Drop

| Aspect | Detail |
|--------|--------|
| Cause | Network loss, browser crash, timeout |
| Impact | Session interrupted |
| Detection | Heartbeat failure, disconnect event |
| Mitigation | Auto-reconnect, session state preservation |
| Recovery | Reconnect or resume session |
| UX | "Connection lost. Reconnecting..." |
| Data | Session state preserved on disconnect |
| Security | Session token revalidated on reconnect |

---

## 4. NETWORK FAILURES

### 4.1 Network Loss

| Aspect | Detail |
|--------|--------|
| Cause | Internet disconnection |
| Impact | All online features unavailable |
| Detection | Connection monitoring |
| Mitigation | Offline indicators, local state preservation |
| Recovery | Auto-reconnect when network returns |
| UX | "You're offline. Some features unavailable." |
| Data | Local state preserved, synced on reconnect |
| Security | No security impact |

### 4.2 WebSocket Disconnect

| Aspect | Detail |
|--------|--------|
| Cause | Server restart, network issue, timeout |
| Impact | Real-time features interrupted |
| Detection | Disconnect event |
| Mitigation | Auto-reconnect with backoff |
| Recovery | State resync on reconnect |
| UX | Brief interruption, auto-recovery |
| Data | Server state preserved |
| Security | Reauthentication on reconnect |

---

## 5. RECORDING FAILURES

### 5.1 Voice Recording Failure

| Aspect | Detail |
|--------|--------|
| Cause | Microphone access denied, browser limitation, storage full |
| Impact | Voice evidence not captured |
| Detection | Recording error event |
| Mitigation | Fallback to other evidence types |
| Recovery | Manual retry |
| UX | "Voice recording unavailable. Continue without it." |
| Data | Partial recording preserved if possible |
| Security | No security impact |

### 5.2 Video Recording Failure

| Aspect | Detail |
|--------|--------|
| Cause | Camera access denied, browser limitation, storage full, plan limit |
| Impact | Video evidence not captured |
| Detection | Recording error event |
| Mitigation | Fallback to other evidence types |
| Recovery | Manual retry |
| UX | "Video recording unavailable. Continue without it." |
| Data | Partial recording preserved if possible |
| Security | No security impact |

---

## 6. PDF GENERATION FAILURES

### 6.1 Whiteboard PDF Export Failure

| Aspect | Detail |
|--------|--------|
| Cause | Server overload, rendering error, large file |
| Impact | Whiteboard evidence not exportable |
| Detection | Export error event |
| Mitigation | Retry, reduce complexity |
| Recovery | Manual retry |
| UX | "PDF generation failed. Please try again." |
| Data | Whiteboard state preserved, PDF not generated |
| Security | No security impact |

---

## 7. VIRTUAL LAB FAILURES

### 7.1 Lab Generation Failure

| Aspect | Detail |
|--------|--------|
| Cause | AI generation failure, invalid spec, validation error |
| Impact | Learner cannot start lab |
| Detection | Generation error, validation failure |
| Mitigation | Suggest alternative scenario, retry |
| Recovery | Regenerate with different parameters |
| UX | "Couldn't generate that lab. Try a different scenario." |
| Data | No data loss |
| Security | Lab spec validated before execution |

### 7.2 Lab Execution Failure

| Aspect | Detail |
|--------|--------|
| Cause | Rendering error, resource exhaustion, browser limitation |
| Impact | Lab session interrupted |
| Detection | Runtime error, resource monitoring |
| Mitigation | Graceful shutdown, state preservation |
| Recovery | Restart lab from saved state |
| UX | "Lab encountered an error. Restarting..." |
| Data | Last saved state preserved |
| Security | Sandbox prevents escape |

### 7.3 Lab Resource Exhaustion

| Aspect | Detail |
|--------|--------|
| Cause | Complex lab, long session, memory leak |
| Impact | Lab becomes unresponsive |
| Detection | Resource monitoring |
| Mitigation | Resource limits, auto-save |
| Recovery | Graceful shutdown, state recovery |
| UX | "Lab reached time limit. Saving your progress." |
| Data | Auto-saved state preserved |
| Security | Sandbox prevents system impact |

---

## 8. SIMULATION FAILURES

### 8.1 External Simulation Unavailable

| Aspect | Detail |
|--------|--------|
| Cause | PhET server down, network issue |
| Impact | External simulation not accessible |
| Detection | Load error, timeout |
| Mitigation | Fallback message, suggest alternative |
| Recovery | Retry when available |
| UX | "External simulation unavailable. Try again later." |
| Data | No data loss |
| Security | External content sandboxed |

---

## 9. DATABASE FAILURES

### 9.1 Database Unavailable

| Aspect | Detail |
|--------|--------|
| Cause | Server outage, network failure, overload |
| Impact | All data operations fail |
| Detection | Connection error, health check |
| Mitigation | Connection pooling, retry, queue |
| Recovery | Auto-reconnect, manual intervention |
| UX | "Service temporarily unavailable. Please try again." |
| Data | No data loss (if properly managed) |
| Security | No security impact |

### 9.2 Data Corruption

| Aspect | Detail |
|--------|--------|
| Cause | Bug, concurrent modification, infrastructure failure |
| Impact | Incorrect data |
| Detection | Consistency checks, error logging |
| Mitigation | Backup restoration, data validation |
| Recovery | Restore from backup |
| UX | "An error occurred. We're investigating." |
| Data | Backup available |
| Security | Audit trail helps identify cause |

---

## 10. PAYMENT FAILURES

### 10.1 Payment Processing Failure

| Aspect | Detail |
|--------|--------|
| Cause | Provider error, card declined, network issue |
| Impact | Subscription not activated |
| Detection | Payment error response |
| Mitigation | Retry, suggest alternative payment |
| Recovery | Manual retry, support intervention |
| UX | "Payment failed. Please try again or contact support." |
| Data | Payment attempt logged |
| Security | Financial data handled by provider |

### 10.2 Duplicate Payment

| Aspect | Detail |
|--------|--------|
| Cause | Race condition, retry without idempotency |
| Impact | User charged twice |
| Detection | Idempotency key check, reconciliation |
| Mitigation | Idempotent payment operations |
| Recovery | Automatic refund of duplicate |
| UX | "Duplicate charge detected. Refunding." |
| Data | Idempotency record maintained |
| Security | Financial audit trail |

### 10.3 Entitlement Failure

| Aspect | Detail |
|--------|--------|
| Cause | Entitlement sync error, caching issue |
| Impact | User denied valid access or given excess access |
| Detection | Entitlement check mismatch |
| Mitigation | Real-time entitlement check, cache invalidation |
| Recovery | Entitlement resync |
| UX | "Verifying your access..." |
| Data | Entitlement records authoritative |
| Security | Server-side entitlement enforcement |

---

## 11. SECURITY FAILURES

### 11.1 Unauthorized Access

| Aspect | Detail |
|--------|--------|
| Cause | Stolen credentials, session hijacking, IDOR |
| Impact | Data breach, privilege escalation |
| Detection | Access logs, anomaly detection |
| Mitigation | Authentication, authorization, audit logging |
| Recovery | Session invalidation, password reset |
| UX | "Your session has expired. Please log in again." |
| Data | Access logged |
| Security | Immediate session invalidation |

### 11.2 Privilege Escalation

| Aspect | Detail |
|--------|--------|
| Cause | Bug in authorization, role bypass |
| Impact | User gains unauthorized access |
| Detection | Authorization audit, anomaly detection |
| Mitigation | Server-side role checks, least privilege |
| Recovery | Revoke access, fix vulnerability |
| UX | "You don't have permission to do that." |
| Data | Access logged |
| Security | Immediate revocation |

---

## 12. COMMUNITY FAILURES

### 12.1 Community Abuse

| Aspect | Detail |
|--------|--------|
| Cause | Malicious user, spam, harmful content |
| Impact | Platform safety, user experience |
| Detection | Moderation tools, user reports, AI detection |
| Mitigation | Content filtering, rate limiting, moderation |
| Recovery | Content removal, user action |
| UX | "This content has been removed for review." |
| Data | Moderation record created |
| Security | Abuse prevention active |

### 12.2 Institution Link Misuse

| Aspect | Detail |
|--------|--------|
| Cause | Link shared beyond intended audience |
| Impact | Unauthorized session access |
| Detection | Usage monitoring, anomaly detection |
| Mitigation | Link expiry, usage limits, token validation |
| Recovery | Link revocation |
| UX | "This link is no longer valid." |
| Data | Usage logged |
| Security | Link tokens validated |

---

## 13. STORAGE FAILURES

### 13.1 Storage Exhaustion

| Aspect | Detail |
|--------|--------|
| Cause | High usage, large files, retention policy |
| Impact | Cannot save new evidence |
| Detection | Storage monitoring, quota checks |
| Mitigation | Storage limits per plan, cleanup old data |
| Recovery | Upgrade plan, manual cleanup |
| UX | "Storage limit reached. Upgrade for more space." |
| Data | Existing data preserved |
| Security | No security impact |
