# Vanish

Share a secret with a single link. Whoever opens it gets one look, and the
message is deleted from the server in the same request that displays it.

Built as a 5th semester project: Spring Boot 3 on the back, React + Vite on the
front, no database.

```
Vanish/
  backend/    Spring Boot 3.5 / Java 21 / Maven
  frontend/   React 19 / Vite / Tailwind 4
```

## What it does

1. You write a message and press **Create Secret Link**.
2. The backend generates a UUID, stores the message in memory, and returns the UUID.
3. You get a link like `http://localhost:5173/s/8f14e45f-ceea-467f-a2c4-9b5d4a2e1f30`.
4. The recipient opens it, presses **Reveal Message**, and reads it.
5. The message is destroyed at the exact moment it is shown. Reloading gives
   "This secret has vanished."

The message itself is never part of the URL — only the random id is.

## Running it

You need **Java 21** and **Node 20+**. Two terminals.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

If you don't have the wrapper, use a local Maven install:

```bash
cd backend
mvn spring-boot:run
```

It starts on **http://localhost:8080**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

It starts on **http://localhost:5173** and talks to the backend on port 8080.
If you run the backend somewhere else, set the URL before starting Vite:

```bash
VITE_API_BASE_URL=http://localhost:9000 npm run dev
```

Open http://localhost:5173 and you're done.

## Trying the API by hand

Create a secret:

```bash
curl -i -X POST http://localhost:8080/api/secrets \
  -H 'Content-Type: application/json' \
  -d '{"message":"This is my secret"}'
```

```json
{"id":"8f14e45f-ceea-467f-a2c4-9b5d4a2e1f30"}
```

Read it once:

```bash
curl -i http://localhost:8080/api/secrets/8f14e45f-ceea-467f-a2c4-9b5d4a2e1f30
```

```json
{"message":"This is my secret"}
```

Read it again — 404 this time:

```json
{"error":"This secret has vanished."}
```

Empty or oversized messages are rejected with 400:

```bash
curl -i -X POST http://localhost:8080/api/secrets \
  -H 'Content-Type: application/json' \
  -d '{"message":""}'
```

### Endpoints

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| `POST` | `/api/secrets` | `200` + `{"id":"..."}` | `400` + `{"error":"..."}` |
| `GET` | `/api/secrets/{id}` | `200` + `{"message":"..."}` | `404` + `{"error":"..."}` |

Limits: the message must not be blank and must be 5,000 characters or fewer.

## How a one-time secret actually works

Everything lives in one `ConcurrentHashMap<String, String>` in `SecretService`:
the key is the UUID, the value is the message text.

The whole trick is one line in `SecretService`:

```java
public String consumeSecret(String id) {
    return unreadSecrets.remove(id);
}
```

`ConcurrentHashMap.remove()` is atomic. It finds the entry and deletes it in a
single locked step, returning whatever was there. Two requests arriving at the
same millisecond with the same id will therefore both call `remove`, but only
one of them gets the String back — the second sees `null` and the controller
turns that into a 404. There is no window where both can read the message.

That's also why the reveal is a single `GET` rather than "GET the message, then
DELETE it". With two calls, a crash between them would leave the message alive
after it had already been shown.

`ConcurrentHashMap` (instead of `HashMap`) matters because Tomcat serves each
request on its own thread. A plain `HashMap` could corrupt itself or drop
entries when two threads write at once.

## Things this version does not do

Worth being explicit about, because these are the obvious next questions:

- **Secrets vanish when the backend restarts.** Everything is in RAM. A restart
  or redeploy clears every unread secret, and any link that hasn't been opened
  yet is dead.
- **There is no end-to-end encryption.** The message travels over plain HTTP in
  development and the server holds it in readable memory while it waits. Don't
  send anything you couldn't afford to have exposed.
- **No expiry timer.** A secret lives until it's read or the server restarts.
  Adding a timestamp per entry and a scheduled sweep would be the natural next
  step.
- **No rate limiting.** Anyone who can reach the API can create secrets.

For a real deployment you'd put this behind HTTPS, set
`server.forward-headers-strategy=framework` if there's a proxy, and replace the
permissive CORS rule in `SecretController` with the actual frontend origin.

## Tests

Backend, 13 tests (service behaviour, HTTP layer, and a 32-thread race for the
one-read guarantee):

```bash
cd backend
mvn test
```

There's also a shell script that exercises a running server, including 20
parallel reads of the same id:

```bash
cd backend
./test-api.sh
```

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

## Code layout

```
backend/src/main/java/com/example/vanish/
  VanishApplication.java      @SpringBootApplication — starts the app
  SecretController.java       the two HTTP endpoints, CORS, validation
  SecretService.java          the ConcurrentHashMap and the atomic remove
  CreateSecretRequest.java    the JSON body for POST /api/secrets

frontend/src/
  App.jsx                     reads /s/:id from the URL, picks the page
  CreateSecret.jsx            compose, counter, share link, copy button
  ReadSecret.jsx              sealed → reveal → message, plus the gone state
  Shell.jsx                   header, centered column, footer
  api.js                      the two fetch calls
  useCopy.js                  clipboard helper with a fallback
```

No Lombok, no database, no auth, no Docker — just the pieces the app needs.
