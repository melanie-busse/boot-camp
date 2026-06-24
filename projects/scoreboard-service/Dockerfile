# --- STAGE 1: Builder ---
FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Hier würden in echten Projekten alle Dev-Abhängigkeiten (wie TypeScript) installiert
RUN npm install
COPY . .
# Hier würde normalerweise der Build-Schritt laufen (z.B. npm run build)

# --- STAGE 2: Runtime (Das finale, schlanke Image) ---
FROM node:26-alpine AS runtime
WORKDIR /app
# Wir holen uns NUR die package.json aus der ersten Stage
COPY --from=builder /app/package*.json ./
# Installiert nur die echten Produktions-Abhängigkeiten
RUN npm install --omit=dev
# Wir holen uns NUR den fertigen Code (bei TS wäre das der dist-Ordner, hier die index.js)
COPY --from=builder /app/index.js ./

CMD ["npm", "start"]