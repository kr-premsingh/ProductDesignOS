FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY services/api/package.json services/api/package.json
COPY services/ai/package.json services/ai/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build --workspace services/ai
RUN npm run build --workspace services/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app /app
COPY services/api/src services/api/src
COPY services/ai/src services/ai/src
WORKDIR /app/services/api
EXPOSE 4000
CMD ["npm", "run", "start"]
