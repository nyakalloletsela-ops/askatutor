# ASKATUTORLIVE — INSTITUTION ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

Institutions are supported but NOT the primary target market. Institutions can distribute sessions to learners via links without requiring individual accounts.

---

## 2. INSTITUTION MODEL

### 2.1 Institution Account

| Attribute | Description |
|-----------|-------------|
| Institution ID | Unique identifier |
| Name | Institution name |
| Admin | Institution admin account |
| Status | Active/suspended |
| Classes | Classes within institution |
| Reports | Institution-scoped reports |

### 2.2 Institution Class

| Attribute | Description |
|-----------|-------------|
| Class ID | Unique identifier |
| Institution ID | Parent institution |
| Name | Class name |
| Description | Class description |
| Sessions | Sessions created for this class |

### 2.3 Institution Session

| Attribute | Description |
|-----------|-------------|
| Session ID | Unique identifier |
| Class ID | Parent class |
| Session Data | Learning session configuration |
| Link Token | Token for shareable link |
| Participants | Learners who joined via link |

### 2.4 Institution Link

| Attribute | Description |
|-----------|-------------|
| Link ID | Unique identifier |
| Session ID | Target session |
| Token | Unique shareable token |
| Uses | Number of times used |
| Expires At | Expiration timestamp |
| Max Uses | Optional usage limit |

---

## 3. INSTITUTION LINK FLOW

```
1. Institution admin creates class
2. Institution admin creates session for class
3. System generates unique link with token
4. Institution admin distributes link to learners
5. Learners click link → join session
6. Learners identified within institution context (NOT anonymous)
7. Learners do NOT need individual AskATutorLive accounts
8. Learners participate in session
9. Session produces evidence
10. Institution admin receives evidence and reports
```

---

## 4. INSTITUTION-LINK LEARNER IDENTITY

| Aspect | Rule |
|--------|------|
| Account required? | NO |
| Anonymous? | NO |
| Identification | Within institution context only |
| Scope | Limited to the specific session |
| Data retention | Per institution data retention rules |
| Cross-session identity | Only if institution manages it |

Institution-link learners are identified by whatever identifier the institution provides (name, student ID, email, etc.). They are NOT anonymous — they are identified within the institution's controlled context.

---

## 5. INSTITUTION REPORTING

| Report Type | Contents |
|-------------|----------|
| Session Summary | Participants, duration, activities |
| Learning Evidence | Whiteboard PDFs, recordings, notes |
| Progress Report | Learner progress within institution sessions |
| Usage Report | Link usage, session participation |
| Custom Reports | Configurable per institution |

---

## 6. INSTITUTION DATA BOUNDARIES

| Data | Institution Access |
|------|-------------------|
| Institution members | Full |
| Institution sessions | Full |
| Institution evidence | Full |
| Institution reports | Full |
| Individual learner data (non-institution) | None |
| Platform-wide data | None |
| Other institutions' data | None |

---

## 7. INSTITUTION COMMERCE

| Aspect | Description |
|--------|-------------|
| Billing | Institution-level billing |
| Plans | Institution-specific plans |
| Usage | Track institutional usage |
| Limits | Institution-scoped limits |

---

## 8. INSTITUTION SECURITY

| Control | Description |
|---------|-------------|
| Link validation | Verify link token and expiry |
| Usage limits | Enforce max uses per link |
| Participant tracking | Track who joined via link |
| Data isolation | Institution data is isolated |
| Admin authorization | Only institution admin can manage |
| Audit logging | Log institution actions |

---

## 9. INSTITUTION PHASING

| Phase | Deliverable |
|-------|------------|
| Phase 8 | Institution accounts, classes, links, basic reports |
| Phase 9 | Institution commerce, advanced reports |
| Phase 10 | Institution admin portal, analytics |
| Phase 13+ | Institution-specific features, LMS integration |
