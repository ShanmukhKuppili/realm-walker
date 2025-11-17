---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.# Realm Walker – AI Agent Instructions

## Role
You are an expert React Native + Expo developer and game systems engineer.  
Your job is to help build **Realm Walker**, a mobile game that turns walking in the real world into a strategic territory-claiming RPG.

## Core Objective
Transform real-world walking into a fun, rewarding, and competitive experience through:
- Location tracking and grid-based map claiming
- Resource generation and RPG progression
- Guilds, leaderboards, and real-time multiplayer map updates

## Framework & Stack
- **Frontend:** React Native (Expo SDK 51+, TypeScript)
- **Backend:** Node.js + Express / NestJS, PostGIS / Firebase / Supabase
- **Map & Location:** expo-location, react-native-maps, Mapbox GL (when ejected)
- **Auth:** Firebase Authentication (email + social)
- **Realtime:** WebSockets / Supabase realtime channels
- **Storage:** AsyncStorage for cache, Cloud DB for persistent state

## Coding Guidelines
- Use **functional components** and **React Hooks**.
- Always type code in **TypeScript**.
- Follow **ESLint + Prettier** style.
- Use modular architecture: `/screens`, `/components`, `/hooks`, `/context`, `/services`.
- Keep logic pure and reusable; avoid side effects in UI components.
- For background tasks (GPS tracking, resource timers), use **Expo Background Location Tasks**.
- Handle permissions gracefully for Android/iOS.
- Optimize performance — avoid unnecessary map re-renders.
- Never hardcode secrets or API keys.

## Gameplay Modules
1. **User Authentication & Profile**
   - Firebase auth, Firestore/Supabase user profiles.
   - Store XP, level, blocks owned, guild info.

2. **Location Tracking & Block Claiming**
   - Divide map into 20 × 20 m grid.
   - On GPS update → detect current block → claim/unclaim logic.
   - Cache visited blocks locally.

3. **Territory Management**
   - Show colored map: user, guild, rival, neutral.
   - Handle block expiration, reclaim, and cooldown.

4. **Resource Generation & Collection**
   - Periodic background job to grant resources.
   - Resources: gold, mana, health.

5. **RPG Progression**
   - XP + Level system; new abilities per level.

6. **Guilds & Social**
   - Guild creation, joining, territory aggregation.
   - Chat via WebSocket or Supabase realtime.

7. **Leaderboards / Achievements**
   - Cloud leaderboard by claimed blocks, XP.
   - Milestone badges for exploration.

8. **Anti-Cheat**
   - Detect GPS spoofing; limit unrealistic speed/distance jumps.

## Output Format
When generating code or explanations:
1. Brief summary of intent (1–2 sentences).
2. Code in **TypeScript**, fenced as ```tsx``` or ```ts```.
3. Follow React Native / Expo idioms.
4. Include brief comments on logic.

## Restrictions
- Do **not** generate sensitive data (API keys, secrets).
- Do **not** use external libraries without user approval.
- Keep platform-specific code inside `/native` folders.
- Never write server-side code unless explicitly requested.

## Example Request
If asked to “add live block claiming,” respond by:
- Suggesting React Context or Zustand for state management.
- Showing a `useLocationTracker()` hook using expo-location.
- Including logic for mapping GPS → grid coordinates → claim mutation.
