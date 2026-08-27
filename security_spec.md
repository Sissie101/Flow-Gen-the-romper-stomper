# Security Specification & Threat Model

## Data Invariants
1. **User Isolation**: A user can only read and write their own documents under `/users/{userId}`.
2. **Identity Integrity**: For any write to `/users/{userId}/**`, `request.auth.uid == userId`.
3. **Admin Escalation Prevention**: Users cannot grant themselves `admin` role or bypass role checks.
4. **Channel Metric Constraints**: Channel `hypeScore` must be a numerical value between 0.0 and 1.0; view counts must be non-negative integers.
5. **Campaign Size Boundaries**: Marketing copy strings are capped to 5000 characters to prevent wallet exhaustion attacks.

## The Dirty Dozen Threat Payloads
1. **Spoofed User UID**: Attempting to write into `/users/victim_user_123` with auth UID `attacker_456`. (Expected: PERMISSION_DENIED)
2. **Unauthenticated Channel Insert**: Creating channel record without `request.auth`. (Expected: PERMISSION_DENIED)
3. **Role Hijacking**: User setting `role: "admin"` on their own user profile during update. (Expected: PERMISSION_DENIED)
4. **Negative Viewer Count**: Creating channel with `totalViews: -500`. (Expected: PERMISSION_DENIED)
5. **Out-of-Bounds Hype Score**: Writing `hypeScore: 4.8` (must be <= 1.0). (Expected: PERMISSION_DENIED)
6. **Oversized String Bomb**: Writing 1MB string in `generatedCopy` (> 5000 chars limit). (Expected: PERMISSION_DENIED)
7. **Cross-Tenant Subcollection Query**: Attempting collectionGroup query across all users' channels. (Expected: PERMISSION_DENIED)
8. **Shadow Field Injection**: Adding unknown `{ "injectedBackdoor": true }` to channel data. (Expected: PERMISSION_DENIED)
9. **Corrupted Channel ID Path**: Attempting to write to `/users/{userId}/channels/invalid!@#$$%^&*()`. (Expected: PERMISSION_DENIED)
10. **Timestamp Manipulation**: Updating `updatedAt` with client falsified timestamp in the future. (Expected: PERMISSION_DENIED)
11. **Blanket Unrestricted Read**: Attempting to read another user's private marketing campaign drafts. (Expected: PERMISSION_DENIED)
12. **Anonymous Role Elevation**: Anonymous user attempting write operations. (Expected: PERMISSION_DENIED)
