package com.example.vanish;

/**
 * The JSON body that the frontend sends to POST /api/secrets.
 *
 * It looks like: { "message": "This is my secret" }
 *
 * Spring converts the JSON into this object automatically because the controller
 * parameter is annotated with @RequestBody. Jackson needs the getter and setter
 * so it can read and fill the field.
 */
public class CreateSecretRequest {

    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
