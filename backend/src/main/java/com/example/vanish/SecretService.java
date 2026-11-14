package com.example.vanish;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Holds every unread secret in memory.
 *
 * @Service tells Spring to create one instance of this class and hand it to
 * whoever asks for it (the controller, in our case). The instance lives for
 * as long as the application runs, so it works as a tiny store without a
 * database. The flip side: every restart wipes all unread secrets.
 */
@Service
public class SecretService {

    /**
     * The key is the UUID we hand out in the link, the value is the message.
     *
     * ConcurrentHashMap is used because Tomcat handles requests on many
     * threads at the same time. A plain HashMap could break or lose entries
     * when two requests write at once.
     */
    private final ConcurrentHashMap<String, String> unreadSecrets = new ConcurrentHashMap<>();

    /**
     * Stores a message and returns the id that goes into the share link.
     */
    public String createSecret(String message) {
        String id = UUID.randomUUID().toString();
        unreadSecrets.put(id, message);
        return id;
    }

    /**
     * Returns the message for this id and deletes it in the same step.
     *
     * remove() on a ConcurrentHashMap is atomic: the map locks just the one
     * bucket, checks the entry, and deletes it. If two requests arrive at the
     * same moment with the same id, only one of them receives the message.
     * The other gets null and is told the secret has vanished.
     *
     * Doing the read and the delete together is also safer than "GET the
     * message, then call DELETE afterwards", because a crash or a second
     * request in between could expose the message twice.
     */
    public String consumeSecret(String id) {
        return unreadSecrets.remove(id);
    }
}
