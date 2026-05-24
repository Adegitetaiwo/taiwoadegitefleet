# Firebase Security Specification

## Data Invariants
1. **User Ownership Isolation**: Every modeled vehicle document inside `/users/{userId}/vehicles/{vehicleId}` must strictly match the owner: `userId == request.auth.uid`.
2. **Access Safeguards**: Read and write access is strictly limited to the matching authenticating User ID. No public, blanket, or anonymized cross-read is permitted.
3. **Immutability Protection**: Once a vehicle has been initialized, its `userId` and `createdAt` cannot be modified by any updater.
4. **Data Verification**: Numeric values like `purchasePrice` and rates should be valid positive numbers, and text fields should remain within acceptable character lengths.

## The Dirty Dozen Payloads (Threat Assessment)
1. **Unauthenticated Read Request**: Read of `users/user_abc/vehicles/vehicle_123` by an unauthenticated visitor. *Expected outcome: PERMISSION_DENIED*
2. **Cross-User Hijack Attempt**: Read of `users/victim_uid/vehicles/vehicle_123` by `attacker_uid`. *Expected outcome: PERMISSION_DENIED*
3. **Cross-User Creation Attempt**: Signed-in user `attacker_uid` trying to create a document at `users/victim_uid/vehicles/vehicle_123`. *Expected outcome: PERMISSION_DENIED*
4. **Owner ID Spoof Attack**: Signed-in user `user_123` setting the vehicle's `userId` field to `admin_user`. *Expected outcome: PERMISSION_DENIED*
5. **ID Poisoning Attack**: Trying to create vehicle with a 45KB corrupted string as the `vehicleId`. *Expected outcome: PERMISSION_DENIED*
6. **Negative Value Creation**: Creating a vehicle with a `purchasePrice` of `-1000000`. *Expected outcome: PERMISSION_DENIED*
7. **Giant Payload Denying Wallet**: Attempting to upload a document containing high volumes of junk map property variables. *Expected outcome: PERMISSION_DENIED*
8. **Immutability Mutation Bypass**: Owner user attempting to change their own initialized `userId` field to another user key. *Expected outcome: PERMISSION_DENIED*
9. **Creation Timestamp Spoofing**: Setting `createdAt` to a year in the future instead of server's current time. *Expected outcome: PERMISSION_DENIED*
10. **Unverified Email Access**: Writing files when signed-in with an email provider where verification status check is disabled (if verification is enforced).
11. **Blanket Query Scraping**: Attempting to query `vehicles` collection group across all users. *Expected outcome: PERMISSION_DENIED*
12. **Out of Range Percentage Value**: Forcing a `salvageValuePercent` of `500` (above 100%). *Expected outcome: PERMISSION_DENIED*

All testing assertions require returned status codes to match cryptographic rejection criteria.
