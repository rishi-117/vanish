package com.example.vanish;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The two endpoints the frontend talks to.
 *
 * @RestController means every method returns data (JSON), not a view name.
 * @RequestMapping("/api/secrets") puts that prefix in front of all endpoints
 * below, so the paths are POST /api/secrets and GET /api/secrets/{id}.
 *
 * @CrossOrigin allows the browser to call this API from the Vite dev server.
 * Without it the browser blocks the response (CORS). Vite starts on port 5173
 * and moves to the next free port if that one is taken, so the pattern allows
 * any localhost port. When you deploy, replace this with the real frontend
 * origin and serve everything over HTTPS.
 */
@RestController
@RequestMapping("/api/secrets")
@CrossOrigin(originPatterns = {"http://localhost:[*]", "http://127.0.0.1:[*]"})
public class SecretController {

    private static final int MAX_MESSAGE_LENGTH = 5000;

    private final SecretService secretService;

    /**
     * Spring sees the constructor needs a SecretService and passes in the
     * @Service instance it already created. This is constructor injection,
     * the plainest form of dependency injection.
     */
    public SecretController(SecretService secretService) {
        this.secretService = secretService;
    }

    /**
     * POST /api/secrets
     * Body: {"message": "This is my secret"}
     * 200:  {"id": "generated-uuid"}
     * 400:  {"error": "..."} for empty or oversized messages
     *
     * @RequestBody turns the incoming JSON into a CreateSecretRequest.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createSecret(@RequestBody CreateSecretRequest request) {
        String message = request.getMessage();

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Write a message before creating a link."));
        }

        if (message.length() > MAX_MESSAGE_LENGTH) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "That message is too long. The limit is 5,000 characters."));
        }

        String id = secretService.createSecret(message);
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * GET /api/secrets/{id}
     * 200: {"message": "..."} and the secret is deleted at the same moment
     * 404: {"error": "..."} when the id never existed or was already read
     *
     * @PathVariable takes the {id} part out of the URL. We treat it as a
     * plain String instead of a UUID so that a malformed id just behaves like
     * an unknown one (404) instead of crashing with a conversion error.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, String>> readSecret(@PathVariable String id) {
        String message = secretService.consumeSecret(id);

        if (message == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "This secret has vanished."));
        }

        return ResponseEntity.ok(Map.of("message", message));
    }
}
