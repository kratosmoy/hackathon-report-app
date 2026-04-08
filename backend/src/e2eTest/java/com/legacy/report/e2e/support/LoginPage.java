package com.legacy.report.e2e.support;

import com.microsoft.playwright.Page;

public class LoginPage extends AbstractE2EPage {
    private static final String USERNAME_INPUT = "[data-testid='login-username']";
    private static final String PASSWORD_INPUT = "[data-testid='login-password']";
    private static final String SUBMIT_BUTTON = "[data-testid='login-submit']";

    public LoginPage(Page page) {
        super(page);
    }

    public void open(String loginUrl) {
        page.navigate(loginUrl);
        waitForVisible(USERNAME_INPUT);
    }

    public void loginAs(String username, String password, String expectedUrlGlob) {
        page.locator(USERNAME_INPUT).fill(username);
        page.locator(PASSWORD_INPUT).fill(password);
        page.locator(SUBMIT_BUTTON).click();
        page.waitForURL(expectedUrlGlob);
    }
}
