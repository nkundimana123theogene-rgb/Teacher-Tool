# Security Specification - Nkorera Education Portal

## Data Invariants
1. A Lesson Plan (CBC or Remedial) must belong to a valid authenticated user and cannot be accessed by anyone else.
2. Only verified Administrators can modify global configurations (`app_config`) and `announcements`.
3. User Profiles and Subscriptions are private to the user, except for the Admin who can manage them.
4. All IDs must be strictly validated to prevent resource exhaustion attacks.
5. Critical timestamps (`createdAt`, `updatedAt`) must be immutable or strictly controlled.

## The "Dirty Dozen" Payloads (Denial Tests)

### Identity Spoofing
1. **Attack**: Create a lesson plan with someone else's `userId`.
   - **Target**: `POST /lesson_plans/attack_1`
   - **Payload**: `{ "id": "attack_1", "userId": "victim_uid", ... }` (where victim_uid != requester.uid)
2. **Attack**: Update a lesson plan's `userId` to gain access.
   - **Target**: `PATCH /lesson_plans/existing_id`
   - **Payload**: `{ "userId": "attacker_uid" }`

### Privilege Escalation
3. **Attack**: Self-assign "admin" role in user profile.
   - **Target**: `POST /user_profiles/attacker_uid`
   - **Payload**: `{ "uid": "attacker_uid", "role": "admin", ... }`
4. **Attack**: Modify global app config as a normal user.
   - **Target**: `PATCH /app_config/settings`
   - **Payload**: `{ "isMaintenanceMode": true }`

### Resource Poisoning
5. **Attack**: Inject massive strings into lesson titles to cause "Denial of Wallet".
   - **Target**: `POST /lesson_plans/poison_1`
   - **Payload**: `{ "lessonTitle": "A".repeat(10000), ... }`
6. **Attack**: Use invalid characters in document IDs.
   - **Target**: `POST /lesson_plans/invalid_$$$_id`
   - **Payload**: `{ ... }`

### State Shortcutting
7. **Attack**: Set an expired subscription status to "active" via client SDK.
   - **Target**: `PATCH /subscriptions/my_sub`
   - **Payload**: `{ "status": "active" }`

### Unauthorized Access
8. **Attack**: Read another teacher's lesson plans via `list` query.
   - **Target**: `GET /lesson_plans?userId=victim_uid`
9. **Attack**: Delete a global announcement as a user.
   - **Target**: `DELETE /announcements/news_1`

### Timestamp Integrity
10. **Attack**: Manually set `createdAt` in the future.
    - **Target**: `POST /lesson_plans/time_attack`
    - **Payload**: `{ "createdAt": "2099-01-01T00:00:00Z", ... }`

### PII Leakage
11. **Attack**: Get another user's profile containing their email.
    - **Target**: `GET /user_profiles/victim_uid`

### Metadata Tampering
12. **Attack**: Modify immutable `originalOwnerId` or similar field.
    - **Target**: `PATCH /lesson_plans/existing_id`
    - **Payload**: `{ "userId": "new_uid" }`

## Test Runner (firestore.rules.test.ts)
(Simulated logic to be verified by the rules)
