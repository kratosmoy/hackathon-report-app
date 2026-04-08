package com.legacy.report.e2e.support;

import com.microsoft.playwright.Page;

import java.util.List;

public abstract class AbstractE2EPage {
    protected final Page page;

    protected AbstractE2EPage(Page page) {
        this.page = page;
    }

    protected void waitForVisible(String selector) {
        page.waitForSelector(selector);
    }

    protected void waitForText(String selector, String expectedText) {
        page.waitForFunction(
                "([selector, expectedText]) => {" +
                        " const element = document.querySelector(selector);" +
                        " return !!element && (element.textContent || '').includes(expectedText);" +
                        "}",
                List.of(selector, expectedText)
        );
    }

    protected String textContent(String selector) {
        String text = page.locator(selector).textContent();
        return text == null ? "" : text;
    }
}
