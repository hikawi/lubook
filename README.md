<div align="center">

# Lubook

### A simple free-to-use manga sharing full stack application

![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/hikawi/lubook)
![Backend](https://img.shields.io/github/actions/workflow/status/hikawi/lubook/backend.yml)
![Frontend](https://img.shields.io/github/actions/workflow/status/hikawi/lubook/frontend.yml)

</div>

## Description

This is **not** a production commercial application. This was created just because I hate my group's version of this project. When they suggested building a website where you can read mangas, I envisioned it to be akin to other sharing communities like Archive of Our Own, Wattpad, etc., but their idea is more about a pirating, stealing and reposting mangas, which I do not support.

I don't have any problems with piracy for personal usage, but this situation is within an educational environment, as a project for a Software Engineering course, which is the reason why I find it to be wrong. I have brought up this issues with the group, as an artist myself, I would not be comfortable working on such a project, it is mind boggling how completely normal they feel about stealing works, so I gave up on persuading them and created my own version of said project. I made this project to prove that this can be done, without the need to steal other people's works.

## Tech choices

The backend was originally designed by the group leader to follow the MERN stack (namely MongoDB, ExpressJS, ReactJS, and NodeJS). I was also going to go with the same thing, but that wouldn't be very educational (I lied, I just wanted to try SQL). The roadblocks on the way to setup a SQL server is crazy difficult for a first-timer.

Eventually, I think it's OK to settle on PostgreSQL, ExpressJS, VueJS and NodeJS. Which is mainly, still similar enough, even though I use TypeScript instead of JavaScript. The biggest change here is that Postgres isn't that straightforward to setup tests with, since memory pg servers are too limited and drizzle has problems working with them.

## Problems

<details>
<summary>What about testing data?</summary>

When I started testing frontend side of the project, I quickly ran into a problem I don't know how I haven't thought of before. Because I'm not taking anyone's artworks or writings, that means **I have to do everything**, including the writing and painting myself.

I have a few ideas and renditions for a few short mangas, but drawing it would be another story (haha, pun). As much as I would like to add my own original stories since I also love writing, that would take too much time, so I'll find a way to compensate for it without outright infringing on peoples' copyright.

</details>

## Backend (Express API Routes + PostgreSQL)

In the case that you're reading this while the project is still live, here's a [link](https://api.lubook.club/).

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

## Frontend (VueJS)

The frontend uses a simple Astro + Vue server, hosted on Vercel (free plan, of course) with server-side rendering features.

<details>
<summary>What is Astro?</summary>

AstroJS is a library-agnostic SSR framework. It's heavily content-driven, if your site has a lot of static contents, Astro is one of the best choices. If your page has very dynamic interactivity, for example, games, then Astro isn't for you.

The benefit of Astro is the ability to use ANY (popular enough) UI libraries with it, including React, Vue, Svelte, Solid and Alpine.

</details>
