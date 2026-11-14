package com.example.vanish;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SecretServiceTest {

    @Autowired
    private SecretService secretService;

    @Test
    void createsASecretThatCanBeReadOnce() {
        String id = secretService.createSecret("hello");

        assertEquals("hello", secretService.consumeSecret(id));
    }

    @Test
    void secondReadReturnsNull() {
        String id = secretService.createSecret("hello");

        assertNotNull(secretService.consumeSecret(id));
        assertNull(secretService.consumeSecret(id));
    }

    @Test
    void unknownIdReturnsNull() {
        assertNull(secretService.consumeSecret("does-not-exist"));
    }

    @Test
    void generatedIdsAreUnique() {
        long distinct = IntStream.range(0, 1000)
                .mapToObj(i -> secretService.createSecret("message " + i))
                .distinct()
                .count();

        assertEquals(1000, distinct);
    }

    /**
     * Fires many concurrent reads at one id. Exactly one must receive the
     * message; every other thread has to see null.
     */
    @Test
    void onlyOneConcurrentReaderWins() throws Exception {
        String id = secretService.createSecret("only one may win");

        int threads = 32;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch startLine = new CountDownLatch(1);
        AtomicInteger winners = new AtomicInteger();
        AtomicInteger losers = new AtomicInteger();

        try {
            List<Callable<Void>> jobs = IntStream.range(0, threads)
                    .<Callable<Void>>mapToObj(i -> () -> {
                        startLine.await();
                        if (secretService.consumeSecret(id) != null) {
                            winners.incrementAndGet();
                        } else {
                            losers.incrementAndGet();
                        }
                        return null;
                    })
                    .toList();

            List<Future<Void>> futures = jobs.stream().map(pool::submit).toList();
            startLine.countDown();
            for (Future<Void> future : futures) {
                future.get(5, TimeUnit.SECONDS);
            }
        } finally {
            pool.shutdownNow();
        }

        assertEquals(1, winners.get());
        assertEquals(threads - 1, losers.get());
    }
}
