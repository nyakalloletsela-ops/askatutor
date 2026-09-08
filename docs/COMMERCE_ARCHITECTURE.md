# ASKATUTORLIVE — COMMERCE ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

AskATutorLive is a paid platform. Every meaningful user interaction exists within an entitlement/account model. The platform starts with a FREE tier.

---

## 2. PLAN STRUCTURE

### 2.1 Free Tier

| Feature | Limit |
|---------|-------|
| Learning sessions | Limited per month |
| AI interactions | Limited per month |
| Whiteboard saves | Limited storage |
| Voice recording | Not included or limited |
| Video recording | Not included |
| Virtual labs | Limited per month |
| Community access | Full |
| Tutor access | Limited or pay-per-session |
| Evidence storage | Limited |
| Notes | Limited |

> NOTE: Specific free tier limits are REQUIRES DECISION.

### 2.2 Paid Plans

| Plan | Features |
|------|----------|
| Basic | More sessions, more AI, basic recordings |
| Pro | Unlimited sessions, full AI, all recordings, labs |
| Premium | All features, priority tutor access, advanced labs |
| Institution | Custom plan for institutions |

> NOTE: Plan details and pricing are REQUIRES DECISION.

---

## 3. SUBSCRIPTION MODEL

```typescript
interface Subscription {
  id: string
  account_id: string
  plan_id: string
  status: 'active' | 'past_due' | 'cancelled' | 'expired'
  started_at: Date
  current_period_end: Date
  cancel_at: Date | null
}
```

### 3.1 Subscription Lifecycle

```
Trial (optional)
  → Active
    → Past Due (payment failed)
      → Active (payment retried)
      → Cancelled (payment exhausted)
    → Cancelled (user or admin)
      → Expired (period end)
    → Expired (period end, no renewal)
```

---

## 4. PAYMENT PROCESSING

### 4.1 Principles

- **Server-authoritative**: Never trust client-supplied financial values
- **Idempotent**: Duplicate requests produce same result
- **Auditable**: All transactions logged
- **Reconcilable**: Payment records match provider records
- **Secure**: PCI compliance via provider (Stripe, etc.)

### 4.2 Payment Flow

```
1. User selects plan
2. Platform creates subscription (server-side)
3. Platform creates payment intent (server-side)
4. Client collects payment details (via provider SDK)
5. Provider processes payment
6. Provider confirms to platform (webhook)
7. Platform verifies and activates subscription
8. Platform records transaction
9. Platform updates entitlements
```

### 4.3 Payment Provider

| Provider | Status |
|----------|--------|
| Stripe | RECOMMENDED |
| Other | UNKNOWN — REQUIRES DECISION |

---

## 5. ENTITLEMENTS

### 5.1 Entitlement Model

```typescript
interface Entitlement {
  id: string
  account_id: string
  feature_id: string
  status: 'active' | 'exceeded' | 'expired'
  used: number
  limit: number
  period_start: Date
  period_end: Date
}
```

### 5.2 Feature Entitlements

| Feature | Free | Basic | Pro | Premium |
|---------|------|-------|-----|---------|
| Learning sessions/month | Limited | More | Unlimited | Unlimited |
| AI interactions/month | Limited | More | Unlimited | Unlimited |
| Whiteboard saves | Limited | More | Unlimited | Unlimited |
| Voice recording | No | Yes | Yes | Yes |
| Video recording | No | Limited | Yes | Yes |
| Virtual labs/month | Limited | More | Unlimited | Unlimited |
| Tutor sessions | Pay-per | Included | Priority | Priority |
| Evidence storage | Limited | More | Unlimited | Unlimited |
| Community | Full | Full | Full | Full |

> NOTE: Specific limits are REQUIRES DECISION.

---

## 6. USAGE TRACKING

```typescript
interface UsageRecord {
  id: string
  account_id: string
  feature_id: string
  count: number
  timestamp: Date
}
```

Usage is tracked in real-time and checked against entitlements before feature access.

---

## 7. TUTOR COMMERCE

| Model | Description |
|-------|-------------|
| Pay-per-session | Learner pays per tutoring session |
| Subscription included | Some sessions included in plan |
| Institution paid | Institution pays for tutor access |
| Tutor payout | Tutor receives payment for sessions |

> NOTE: Tutor commerce model is REQUIRES DECISION.

---

## 8. INSTITUTION COMMERCE

| Aspect | Description |
|--------|-------------|
| Billing | Institution-level billing |
| Plans | Custom institution plans |
| Usage tracking | Institution-scoped usage |
| Invoicing | Institution invoices |

---

## 9. FINANCIAL SAFETY

### 9.1 Transaction Safety

- All payment operations are idempotent
- Payment state transitions are validated
- Concurrent payment attempts are handled
- Double-charge prevention

### 9.2 Audit Trail

- Every payment transaction logged
- Subscription changes logged
- Refund/cancellation logged
- Dispute handling logged

### 9.3 Reconciliation

- Daily reconciliation with payment provider
- Discrepancy detection and alerting
- Manual reconciliation tools

---

## 10. REFUND POLICY

> NOTE: Refund policy is REQUIRES DECISION.

General principles:
- Refunds processed server-side
- Refund records are immutable
- Subscription adjusted after refund
- Entitlements revoked after refund
- Audit trail maintained

---

## 11. COMMERCE PHASING

| Phase | Deliverable |
|-------|------------|
| Phase 9 | Plan structure, subscriptions, payments, entitlements |
| Phase 10 | Admin commerce management, reporting |
| Phase 13+ | Advanced billing, promotions, enterprise |
