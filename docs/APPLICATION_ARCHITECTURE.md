# ASKATUTORLIVE — APPLICATION ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

Application use cases are the orchestrated operations that fulfill user requests. They sit between the presentation layer and the domain layer, coordinating domain entities and external services.

---

## 2. APPLICATION USE CASES

### 2.1 Discovery & Onboarding

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| browse_topics | Display available learning topics | filters | topic_list | 1 |
| search_content | Search topics, lessons, resources | query | search_results | 1 |
| onboard_learner | Guide new learner through initial setup | account_data | learner_profile | 2 |
| start_first_lesson | Initiate first lesson with mandatory difficulty interaction | topic_id | session_context | 2 |

---

### 2.2 Learning & Difficulty Identification

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| create_learning_session | Start a new learning session | topic_id, learner_id | session | 2 |
| start_learner_difficulty_interaction | Begin mandatory difficulty/fear exploration | session_id | interaction_context | 2 |
| record_learner_concern | Capture initial learner statement | concern_text | concern_record | 2 |
| ask_clarification_question | AI asks probing question | concern_context | probe_question | 5 |
| identify_learner_stated_difficulty | Learner confirms identified difficulty | learner_response | identified_difficulty | 2 |
| request_tutor | Learner requests human tutor | session_id, reason | tutor_request | 4 |
| complete_lesson | Finalize lesson and capture reflection | session_id | lesson_completion | 2 |
| collect_learner_reflection | Capture learner's final reflection | session_id | reflection_record | 2 |

---

### 2.3 Whiteboard & Evidence

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| create_whiteboard | Create new whiteboard for session | session_id | whiteboard | 3 |
| save_whiteboard | Save whiteboard state | whiteboard_id, state | saved_whiteboard | 3 |
| export_whiteboard_pdf | Export whiteboard as PDF | whiteboard_id | pdf_file | 3 |
| record_voice | Record voice audio | session_id, audio_data | voice_recording | 3 |
| record_video | Record video | session_id, video_data | video_recording | 3 |
| create_learning_evidence | Assemble evidence from session | session_id, evidence_items | evidence_record | 3 |
| view_evidence_library | Display learner's evidence | learner_id | evidence_list | 3 |

---

### 2.4 Tutoring

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| prepare_tutor_briefing | Generate tutor preparation report | session_id, difficulty_data | briefing_report | 4 |
| accept_tutor_session | Tutor accepts assigned session | tutor_id, session_id | assignment | 4 |
| conduct_tutor_session | Run interactive tutoring session | session_id, tutor_id | session_record | 4 |
| confirm_ai_interpretation | Tutor confirms or corrects AI interpretation | interpretation_id, tutor_feedback | confirmed_interpretation | 4 |
| complete_tutoring_session | Finalize tutoring session | session_id | completion_record | 4 |

---

### 2.5 AI Gateway

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| route_ai_request | Route request to appropriate model/provider | request_context, model_preferences | ai_response | 5 |
| validate_ai_output | Validate AI response against safety rules | ai_response | validated_response | 5 |
| enforce_ai_safety | Check response for safety violations | response_content | safety_check_result | 5 |
| track_ai_cost | Record AI usage and cost | request_id, tokens_used, model | cost_record | 5 |
| stream_ai_response | Stream AI response to client | request_id | response_stream | 5 |

---

### 2.6 Virtual Labs

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| create_virtual_lab | AI generates lab scenario | learner_request, topic_context | lab_spec | 7 |
| start_virtual_lab | Initialize lab execution | lab_spec_id | lab_session | 7 |
| interact_with_lab | Learner interacts with lab controls | lab_session_id, action | updated_state | 7 |
| save_virtual_lab | Persist lab for future reuse | lab_session_id | saved_lab | 7 |
| share_virtual_lab | Share lab with others | lab_id, sharing_rules | share_record | 7 |
| view_lab_results | Display lab execution results | lab_session_id | results | 7 |

---

### 2.7 Simulations

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| browse_simulations | List available external simulations | filters | simulation_list | 6 |
| launch_simulation | Open external simulation in context | simulation_id | embed_context | 6 |
| attach_simulation_context | Link simulation to current session | simulation_id, session_id | context_link | 6 |

---

### 2.8 Community

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| create_forum_post | Post to a forum | forum_id, content | post | 11 |
| reply_to_thread | Reply to an existing thread | thread_id, content | reply | 11 |
| join_group | Join a learning group | group_id | membership | 11 |
| share_learning_resource | Share approved resource with community | resource_data | shared_resource | 11 |
| moderate_content | Review and moderate community content | content_id, action | moderation_result | 11 |

---

### 2.9 Institutions

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| create_institution_session | Institution creates a class session | institution_id, class_data | institution_session | 8 |
| generate_institution_link | Generate shareable link for institution session | session_id | institution_link | 8 |
| join_via_institution_link | Learner joins via institution link (no individual account) | link_token, learner_identifier | session_membership | 8 |
| generate_institution_report | Generate institution-specific reports | institution_id, date_range | report | 8 |

---

### 2.10 Commerce & Entitlements

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| view_plans | Display available subscription plans | — | plan_list | 9 |
| subscribe_to_plan | Process plan subscription | user_id, plan_id | subscription | 9 |
| check_entitlement | Verify user's feature access | user_id, feature_id | entitlement_check | 9 |
| enforce_usage_limit | Track and enforce usage limits | user_id, feature_id, usage | enforcement_result | 9 |
| process_payment | Process payment (server-authoritative) | payment_data | payment_result | 9 |
| generate_invoice | Generate invoice for transaction | transaction_id | invoice | 9 |

---

### 2.11 Reporting

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| generate_learner_report | Generate learner progress report | learner_id, date_range | report | 9 |
| generate_tutor_report | Generate tutor performance report | tutor_id, date_range | report | 9 |
| generate_institution_report | Generate institution usage report | institution_id, date_range | report | 9 |
| export_report | Export report as PDF/CSV | report_id | exported_file | 9 |

---

### 2.12 Notifications

| Use Case | Description | Inputs | Outputs | Phase |
|----------|-------------|--------|---------|-------|
| send_notification | Send notification to user | user_id, notification_data | notification | 4 |
| mark_notification_read | Mark notification as read | notification_id | updated_notification | 4 |
| get_user_notifications | Retrieve user's notifications | user_id, filters | notification_list | 4 |

---

## 3. USE CASE COORDINATION

Use cases are orchestrated by application services. Domain entities are not aware of use cases.

```
User Action (Presentation)
  → Controller/Handler
    → Application Use Case
      → Domain Service / Entity
        → Repository (Persistence)
        → External Service (via Port/Adapter)
      ← Domain Result
    ← Application Result
  ← Presentation Response
```
