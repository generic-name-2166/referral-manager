FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist .

ENV POSTGRES_HOST="referral-postres"

EXPOSE 3000

ENTRYPOINT [ "node", "index.cjs" ]
