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
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_CORE_API_URL=http://localhost:4100
ARG API_URL=http://localhost:4000
ARG CORE_API_URL=http://localhost:4100
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CORE_API_URL=$NEXT_PUBLIC_CORE_API_URL
ENV API_URL=$API_URL
ENV CORE_API_URL=$CORE_API_URL
RUN npm run build --workspace apps/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app /app
COPY --from=build /app/apps/web/next.config.mjs apps/web/next.config.mjs
COPY --from=build /app/apps/web/.next apps/web/.next
COPY --from=build /app/apps/web/public apps/web/public
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "start"]
