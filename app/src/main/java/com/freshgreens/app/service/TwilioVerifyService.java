package com.freshgreens.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Service
public class TwilioVerifyService {

    private static final Logger log = LoggerFactory.getLogger(TwilioVerifyService.class);

    private final String accountSid;
    private final String authToken;
    private final String verifyServiceSid;
    private final String proxyHost;
    private final int proxyPort;
    private final boolean useSystemDefaultProxy;
    private final int connectTimeoutMs;
    private final int requestTimeoutMs;
    private final HttpClient httpClient;

    public TwilioVerifyService(
            @Value("${twilio.account.sid:}") String accountSid,
            @Value("${twilio.auth.token:}") String authToken,
            @Value("${twilio.verify.service.sid:}") String verifyServiceSid,
            @Value("${twilio.proxy.host:}") String proxyHost,
            @Value("${twilio.proxy.port:0}") int proxyPort,
            @Value("${twilio.proxy.use-system-default:false}") boolean useSystemDefaultProxy,
            @Value("${twilio.http.connect-timeout-ms:10000}") int connectTimeoutMs,
            @Value("${twilio.http.request-timeout-ms:20000}") int requestTimeoutMs) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.verifyServiceSid = verifyServiceSid;
        this.proxyHost = proxyHost;
        this.proxyPort = proxyPort;
        this.useSystemDefaultProxy = useSystemDefaultProxy;
        this.connectTimeoutMs = connectTimeoutMs;
        this.requestTimeoutMs = requestTimeoutMs;
        this.httpClient = buildHttpClient();
    }

    public void startSmsVerification(String phoneE164) {
        ensureConfigured();

        String url = "https://verify.twilio.com/v2/Services/" + verifyServiceSid + "/Verifications";
        String form = "To=" + encode(phoneE164) + "&Channel=sms";

        String body = executePost(url, form);
        if (!body.contains("\"status\": \"pending\"") && !body.contains("\"status\":\"pending\"")) {
            log.warn("Unexpected Twilio verification start response for {}: {}", phoneE164, body);
        }
    }

    public boolean checkSmsVerification(String phoneE164, String otpCode) {
        ensureConfigured();

        String url = "https://verify.twilio.com/v2/Services/" + verifyServiceSid + "/VerificationCheck";
        String form = "To=" + encode(phoneE164) + "&Code=" + encode(otpCode);

        String body = executePost(url, form);
        return body.contains("\"status\": \"approved\"") || body.contains("\"status\":\"approved\"");
    }

    private String executePost(String url, String form) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofMillis(requestTimeoutMs))
                    .header("Authorization", "Basic " + basicAuth())
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();

            if (status < 200 || status >= 300) {
                log.error("Twilio Verify API call failed. status={}, body={}", status, response.body());
                if (status == 400 || status == 404) {
                    throw new IllegalArgumentException("Invalid phone number or OTP. Use a valid E.164 mobile number.");
                }
                if (status == 401 || status == 403) {
                    throw new IllegalStateException("Phone verification service credentials are invalid.");
                }
                if (status == 429) {
                    throw new IllegalStateException("Too many verification attempts. Please try again later.");
                }
                throw new IllegalStateException("Phone verification service error. Please try again.");
            }

            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Phone verification request interrupted.");
        } catch (IOException e) {
            log.error("Network error calling Twilio Verify: {}", e.toString());
            throw new IllegalStateException("Unable to reach phone verification service. Check internet/proxy/firewall and try again.");
        }
    }

    private HttpClient buildHttpClient() {
        HttpClient.Builder builder = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(connectTimeoutMs));

        if (!isBlank(proxyHost) && proxyPort > 0) {
            builder.proxy(ProxySelector.of(new InetSocketAddress(proxyHost.trim(), proxyPort)));
            log.info("Twilio HTTP client proxy enabled from properties: {}:{}", proxyHost.trim(), proxyPort);
            return builder.build();
        }

        String proxyUrl = firstNonBlank(
                System.getenv("HTTPS_PROXY"),
                System.getenv("https_proxy")
        );

        if (!isBlank(proxyUrl)) {
            try {
                URI uri = proxyUrl.contains("://") ? URI.create(proxyUrl) : URI.create("http://" + proxyUrl);
                if (!isBlank(uri.getHost())) {
                    int port = uri.getPort() > 0 ? uri.getPort() : 8080;
                    builder.proxy(ProxySelector.of(new InetSocketAddress(uri.getHost(), port)));
                    log.info("Twilio HTTP client proxy enabled: {}:{}", uri.getHost(), port);
                }
            } catch (IllegalArgumentException ex) {
                log.warn("Ignoring invalid HTTPS_PROXY value: {}", ex.getMessage());
            }
        }

        // Optional fallback for environments that require system/JVM proxy routing.
        if (useSystemDefaultProxy) {
            Optional<ProxySelector> defaultSelector = Optional.ofNullable(ProxySelector.getDefault());
            if (defaultSelector.isPresent()) {
                builder.proxy(defaultSelector.get());
                log.info("Twilio HTTP client using JVM default proxy selector");
            }
        }

        return builder.build();
    }

    private void ensureConfigured() {
        StringBuilder missing = new StringBuilder();
        if (isBlank(accountSid)) {
            missing.append("TWILIO_ACCOUNT_SID");
        }
        if (isBlank(authToken)) {
            if (missing.length() > 0) missing.append(", ");
            missing.append("TWILIO_AUTH_TOKEN");
        }
        if (isBlank(verifyServiceSid)) {
            if (missing.length() > 0) missing.append(", ");
            missing.append("TWILIO_VERIFY_SERVICE_SID");
        }

        if (missing.length() > 0) {
            throw new IllegalStateException("Twilio Verify is not configured on server. Missing: " + missing);
        }
    }

    private String basicAuth() {
        String raw = accountSid + ":" + authToken;
        return Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value.trim();
            }
        }
        return null;
    }
}
