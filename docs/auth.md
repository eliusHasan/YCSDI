# Firebase Authentication

Firebase handles login. Express verifies Firebase ID tokens and uses MongoDB for app roles, permissions, profiles, enrollments, and business data.

## Frontend

Use `frontend/src/lib/firebase` for Firebase web SDK setup.

Expected login methods:

- Email/password
- Google login
- Facebook login, if enabled in Firebase Console

## Backend

Use `backend/src/modules/auth/firebase` for Firebase Admin setup.

Recommended flow:

1. User logs in with Firebase in React.
2. React sends the Firebase ID token as `Authorization: Bearer <token>`.
3. Express middleware verifies the token with Firebase Admin.
4. The API loads or creates the matching MongoDB user by Firebase UID/email.
5. The API applies internal roles and permissions from MongoDB.
