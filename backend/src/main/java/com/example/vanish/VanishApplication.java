package com.example.vanish;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the Spring Boot application.
 *
 * @SpringBootApplication is a shortcut for three annotations:
 *  - @Configuration: this class can declare Spring beans
 *  - @EnableAutoConfiguration: Spring Boot configures things like the embedded
 *    Tomcat server and the JSON converter for us
 *  - @ComponentScan: Spring finds every class annotated with @RestController,
 *    @Service, etc. in this package and its sub-packages
 */
@SpringBootApplication
public class VanishApplication {

    public static void main(String[] args) {
        SpringApplication.run(VanishApplication.class, args);
    }
}
