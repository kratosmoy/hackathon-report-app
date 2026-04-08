package com.legacy.report.e2e.support;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.Video;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public abstract class BasePlaywrightE2ETest {
    private static final String FRONTEND_BASE_URL = "http://127.0.0.1:4200";
    private static final Path VIDEO_DIR = Path.of("build", "reports", "e2e-videos");

    protected static Playwright playwright;
    protected static Browser browser;
    protected static FrontendDistServer frontendServer;

    protected BrowserContext context;
    protected Page page;
    protected String currentTestSlug;

    @BeforeAll
    static void globalSetup() throws Exception {
        Files.createDirectories(VIDEO_DIR);
        Path baseDistDir = Path.of("../frontend/dist/report-frontend");
        Path browserDistDir = baseDistDir.resolve("browser");
        frontendServer = new FrontendDistServer(
                Files.exists(browserDistDir) ? browserDistDir : baseDistDir,
                4200
        );
        frontendServer.start();

        playwright = Playwright.create();
        browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                .setHeadless(Boolean.parseBoolean(System.getProperty("e2e.headless", "true"))));
    }

    @AfterAll
    static void globalTeardown() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
        if (frontendServer != null) {
            frontendServer.stop();
        }
    }

    @BeforeEach
    void setUpPage(TestInfo testInfo) {
        currentTestSlug = slugify(testInfo.getDisplayName());
        context = browser.newContext(new Browser.NewContextOptions()
                .setRecordVideoDir(VIDEO_DIR));
        page = context.newPage();
        page.setDefaultTimeout(10000);
    }

    @AfterEach
    void closePage() throws IOException {
        Video video = page != null ? page.video() : null;
        if (context != null) {
            context.close();
        }
        if (video != null) {
            Path sourcePath = video.path();
            Path targetPath = VIDEO_DIR.resolve(currentTestSlug + ".webm");
            Files.deleteIfExists(targetPath);
            Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    protected String frontendUrl(String path) {
        return FRONTEND_BASE_URL + path;
    }

    protected Path evidenceVideoPath() {
        return VIDEO_DIR.resolve(currentTestSlug + ".webm");
    }

    private static String slugify(String value) {
        return value
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
