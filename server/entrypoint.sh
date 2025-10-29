#!/bin/sh

pnpm drizzle-kit push
ls -R /app
node src/index.js
