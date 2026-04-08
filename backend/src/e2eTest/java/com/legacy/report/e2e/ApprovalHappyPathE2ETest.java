package com.legacy.report.e2e;

import com.legacy.report.e2e.support.BasePlaywrightE2ETest;
import com.legacy.report.e2e.support.CheckerApprovalPage;
import com.legacy.report.e2e.support.LoginPage;
import com.legacy.report.e2e.support.MakerReportPage;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ApprovalHappyPathE2ETest extends BasePlaywrightE2ETest {
    private static final String PASSWORD = "123456";
    private static final String MAKER_USERNAME = "maker1";
    private static final String CHECKER_USERNAME = "checker1";
    private static final String REPORT_LABEL = "客户交易分析";
    private static final String REPORT_NAME = "Customer Transaction Analysis";

    @Test
    @DisplayName("completes the maker submit and checker approve happy path in the UI")
    void completesApprovalHappyPath() {
        LoginPage makerLoginPage = new LoginPage(page);
        MakerReportPage makerReportPage = new MakerReportPage(page);

        makerLoginPage.open(frontendUrl("/login"));
        makerLoginPage.loginAs(MAKER_USERNAME, PASSWORD, "**/maker");

        makerReportPage.waitForLoaded();
        makerReportPage.selectReportByLabel(REPORT_LABEL);
        makerReportPage.runSelectedReport();
        makerReportPage.waitForCurrentRunStatus("已生成");
        makerReportPage.submitForApproval();
        makerReportPage.waitForSubmitMessage("已提交审批");
        makerReportPage.waitForCurrentRunStatus("待审批");
        makerReportPage.waitForAuditEvent("Generated");
        makerReportPage.waitForAuditEvent("Submitted");

        BrowserContext checkerContext = browser.newContext();
        try {
            Page checkerPage = checkerContext.newPage();
            checkerPage.setDefaultTimeout(10000);

            LoginPage checkerLoginPage = new LoginPage(checkerPage);
            CheckerApprovalPage checkerApprovalPage = new CheckerApprovalPage(checkerPage);

            checkerLoginPage.open(frontendUrl("/login"));
            checkerLoginPage.loginAs(CHECKER_USERNAME, PASSWORD, "**/checker");

            checkerApprovalPage.waitForLoaded();
            checkerApprovalPage.waitForPendingRun(REPORT_NAME);
            checkerApprovalPage.approveSelectedRun("Approved by E2E");
            checkerApprovalPage.waitForDecisionMessage("已批准");
            checkerApprovalPage.refreshHistory();
            checkerApprovalPage.waitForHistoryText(REPORT_NAME);
            checkerApprovalPage.waitForHistoryText("已批准");

            String checkerHistory = checkerApprovalPage.historyText();
            assertTrue(checkerHistory.contains(REPORT_NAME));
            assertTrue(checkerHistory.contains("已批准"));
        } finally {
            checkerContext.close();
        }

        makerReportPage.refreshHistory();
        makerReportPage.waitForHistoryText(REPORT_NAME);
        makerReportPage.waitForHistoryText("已批准");

        String makerHistory = makerReportPage.historyText();
        assertTrue(makerHistory.contains(REPORT_NAME));
        assertTrue(makerHistory.contains("已批准"));
        assertTrue(makerHistory.contains("下载 Excel"));
    }
}
