package com.legacy.report.e2e.support;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

public class FrontendDistServer {
    private final Path distDir;
    private final int port;
    private HttpServer server;

    public FrontendDistServer(Path distDir, int port) {
        this.distDir = distDir;
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/", this::handle);
        server.start();
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private void handle(HttpExchange exchange) throws IOException {
        String requestPath = exchange.getRequestURI().getPath();
        Path candidate = distDir.resolve(requestPath.equals("/") ? "index.html" : requestPath.substring(1));
        Path fileToServe = Files.exists(candidate) && !Files.isDirectory(candidate)
                ? candidate
                : distDir.resolve("index.html");

        byte[] body = Files.readAllBytes(fileToServe);
        exchange.getResponseHeaders().set("Content-Type", resolveContentType(fileToServe));
        exchange.sendResponseHeaders(200, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }

    private String resolveContentType(Path file) {
        String fileName = file.getFileName().toString().toLowerCase(Locale.ROOT);
        if (fileName.endsWith(".html")) {
            return "text/html; charset=utf-8";
        }
        if (fileName.endsWith(".js")) {
            return "text/javascript; charset=utf-8";
        }
        if (fileName.endsWith(".css")) {
            return "text/css; charset=utf-8";
        }
        if (fileName.endsWith(".json")) {
            return "application/json; charset=utf-8";
        }
        return "application/octet-stream";
    }
}
