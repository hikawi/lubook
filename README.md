<div align="center">

# Lubook

### A simple free-to-use manga sharing full stack application

![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/hikawi/openbook)
![Backend](https://img.shields.io/github/actions/workflow/status/hikawi/openbook/backend.yml)
![Backend Coverage](https://img.shields.io/codecov/c/github/hikawi/openbook?label=backend%20coverage)

</div>

## Description

This is **not** a production commercial application. This was created just because I hate my group's version of this project. When they suggested building a website where you can read mangas, I envisioned it to be akin to other sharing communities like Archive of Our Own, Wattpad, etc., but their idea is more about a pirating, stealing and reposting mangas, which I do not support.

I don't have any problems with piracy for personal usage, but this situation is within an educational environment, as a project for a Software Engineering course, which is the reason why I find it to be wrong. I have brought up this issues with the group, as an artist myself, I would not be comfortable working on such a project, it is mind boggling how completely normal they feel about stealing works, so I gave up on persuading them and created my own version of said project. I made this project to prove that this can be done, without the need to steal other people's works.

The architectural design is courtesy of the group manager as he decided on the MERN (Mongo, Express, React, Node) stack. Except that, this uses Astro's file-based routing for API routes, and does not depend on Express servers. The design is courtesy of me, so no credits needed.

## Structure

This is a **monorepo**, which means both the *backend* and the *frontend* is bundled here.

Backend uses:

- `bcryptjs`: Hashing passwords.
- `mongoose`, `mongodb`: The relational noSQL database.
- `vitest`, `mongodb-memory-server`: For testing database calls.
- `express`, `express-async-handler`: For setting up the backend calls.
- `zod`: For validating inputs.

Frontend uses:

- `astro`, `vercel`: Server-side renderer.
- `vue`: UI Library.
- `vitest`, `@vitest/browser`, `mongodb-memory-server`, `playwright`, `@testing-library/vue`: For testing UI.
- `nanostores`: For state management.

### Backend

The backend has documentations on all routes. But I was kinda deep in SCP lore, the comments do reflect that.

Clearance Level (access permissions):

- **0 (Unclassified)**: Everyone can access this endpoint.
- **1 (Confidential)**: Logged in users can access this endpoint.
- **2 (Restricted)**: Approved users can access this endpoint. Approved users are users who have proven themselves to be good within the community.
- **3 (Secret)**: Site moderators can access this endpoint. They are doing most of content moderation work.
- **4 (Top Secret)**: Site administrators can access this endpoint. This involves promoting and demoting moderators.
- **5 (Executive)**: Only those who have access to the console should have access to this endpoint. I have no clue what this is used for.

Object Class (how contained is the action? is it within small regions of collection, or disrupt multiple at once?):

- **Safe**: This involves just looking up, and nothing in the database is changed.
- **Euclid**: Some fields of the database are changed.
- **Keter**: Multiple collections were affected deeply.
- **Apollyon**: The entire database was affected deeply.
