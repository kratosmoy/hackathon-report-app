package com.legacy.report.e2e.support;

import com.microsoft.playwright.Page;

public class CheckerApprovalPage extends AbstractE2EPage {
    private static final String PENDING_RUN_SELECT = "[data-testid='checker-run-select']";
    private static final String DECISION_SELECT = "[data-testid='checker-decision-select']";
    private static final String COMMENT_INPUT = "[data-testid='checker-comment-input']";
    private static final String SUBMIT_DECISION_BUTTON = "[data-testid='checker-submit-decision-button']";
    private static final String MESSAGE = "[data-testid='checker-message']";
    private static final String HISTORY_REFRESH_BUTTON = "[data-testid='checker-history-refresh']";
    private static final String HISTORY_TABLE = "[data-testid='checker-history-table']";

    public CheckerApprovalPage(Page page) {
        super(page);
    }

    public void waitForLoaded() {
        waitForVisible(PENDING_RUN_SELECT);
    }

    public void waitForPendingRun(String text) {
        waitForText(PENDING_RUN_SELECT, text);
    }

    public void approveSelectedRun(String comment) {
        page.locator(DECISION_SELECT).selectOption("APPROVED");
        page.locator(COMMENT_INPUT).fill(comment);
        page.locator(SUBMIT_DECISION_BUTTON).click();
    }

    public void waitForDecisionMessage(String message) {
        waitForText(MESSAGE, message);
    }

    public void refreshHistory() {
        page.locator(HISTORY_REFRESH_BUTTON).click();
    }

    public void waitForHistoryText(String text) {
        waitForText(HISTORY_TABLE, text);
    }

    public String historyText() {
        return textContent(HISTORY_TABLE);
    }
}
