package com.legacy.report.e2e.support;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.SelectOption;

public class MakerReportPage extends AbstractE2EPage {
    private static final String REPORT_SELECT = "[data-testid='maker-report-select']";
    private static final String RUN_REPORT_BUTTON = "[data-testid='maker-run-report-button']";
    private static final String CURRENT_RUN_STATUS = "[data-testid='current-run-status']";
    private static final String SUBMIT_APPROVAL_BUTTON = "[data-testid='maker-submit-approval-button']";
    private static final String SUBMIT_MESSAGE = "[data-testid='maker-submit-message']";
    private static final String CURRENT_RUN_AUDIT_TABLE = "[data-testid='current-run-audit-table']";
    private static final String HISTORY_REFRESH_BUTTON = "[data-testid='maker-history-refresh']";
    private static final String HISTORY_TABLE = "[data-testid='maker-history-table']";

    public MakerReportPage(Page page) {
        super(page);
    }

    public void waitForLoaded() {
        waitForVisible(REPORT_SELECT);
    }

    public void selectReportByLabel(String reportLabel) {
        waitForText(REPORT_SELECT, reportLabel);
        page.locator(REPORT_SELECT).selectOption(new SelectOption().setLabel(reportLabel));
    }

    public void runSelectedReport() {
        page.locator(RUN_REPORT_BUTTON).click();
    }

    public void submitForApproval() {
        waitForVisible(SUBMIT_APPROVAL_BUTTON);
        page.locator(SUBMIT_APPROVAL_BUTTON).click();
    }

    public void waitForCurrentRunStatus(String status) {
        waitForText(CURRENT_RUN_STATUS, status);
    }

    public void waitForSubmitMessage(String message) {
        waitForText(SUBMIT_MESSAGE, message);
    }

    public void waitForAuditEvent(String eventType) {
        waitForText(CURRENT_RUN_AUDIT_TABLE, eventType);
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
