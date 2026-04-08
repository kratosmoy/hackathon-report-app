package com.legacy.report.e2e;

import com.legacy.report.e2e.support.BasePlaywrightE2ETest;
import com.legacy.report.e2e.support.CheckerApprovalPage;
import com.legacy.report.e2e.support.LoginPage;
import com.legacy.report.e2e.support.MakerReportPage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ApprovalEvidenceVideoE2ETest extends BasePlaywrightE2ETest {
    private static final String PASSWORD = "123456";
    private static final String MAKER_USERNAME = "maker1";
    private static final String CHECKER_USERNAME = "checker1";
    private static final String REPORT_LABEL = "客户交易分析";
    private static final String REPORT_NAME = "Customer Transaction Analysis";
    private static final String LOGOUT_BUTTON = "[data-testid='workspace-logout']";

    @Test
    @DisplayName("approval-evidence-video")
    void recordsApprovalEvidenceFlow() {
        LoginPage loginPage = new LoginPage(page);
        MakerReportPage makerReportPage = new MakerReportPage(page);
        CheckerApprovalPage checkerApprovalPage = new CheckerApprovalPage(page);

        loginPage.open(frontendUrl("/login"));
        loginPage.loginAs(MAKER_USERNAME, PASSWORD, "**/maker");

        makerReportPage.waitForLoaded();
        makerReportPage.selectReportByLabel(REPORT_LABEL);
        makerReportPage.runSelectedReport();
        makerReportPage.waitForCurrentRunStatus("已生成");
        makerReportPage.submitForApproval();
        makerReportPage.waitForSubmitMessage("已提交审批");
        makerReportPage.waitForCurrentRunStatus("待审批");

        page.locator(LOGOUT_BUTTON).click();
        page.waitForURL("**/login");

        loginPage.loginAs(CHECKER_USERNAME, PASSWORD, "**/checker");
        checkerApprovalPage.waitForLoaded();
        checkerApprovalPage.waitForPendingRun(REPORT_NAME);
        checkerApprovalPage.approveSelectedRun("Approved for PR evidence");
        checkerApprovalPage.waitForDecisionMessage("已批准");
        checkerApprovalPage.refreshHistory();
        checkerApprovalPage.waitForHistoryText(REPORT_NAME);
        checkerApprovalPage.waitForHistoryText("已批准");

        page.locator(LOGOUT_BUTTON).click();
        page.waitForURL("**/login");

        loginPage.loginAs(MAKER_USERNAME, PASSWORD, "**/maker");
        makerReportPage.waitForLoaded();
        makerReportPage.refreshHistory();
        makerReportPage.waitForHistoryText(REPORT_NAME);
        makerReportPage.waitForHistoryText("已批准");
    }
}
