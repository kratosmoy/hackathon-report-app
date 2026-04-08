import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ReportAuditEvent, ReportRow, ReportRun, ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';

interface Report {
  id: number;
  name: string;
  sql: string;
  description: string;
}

interface ReportData {
  data: ReportRow[];
  count?: number;
  custom?: boolean;
}

type StatusTone = 'generated' | 'submitted' | 'approved' | 'rejected' | 'neutral';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.css']
})
export class ReportViewerComponent implements OnInit {
  reports: Report[] = [];
  selectedReport: Report | null = null;
  reportData: ReportData | null = null;
  loading = false;
  error: string | null = null;
  exportError: string | null = null;

  currentRun: ReportRun | null = null;
  submitMessage: string | null = null;
  submitError: string | null = null;

  currentRunAudit: ReportAuditEvent[] = [];
  currentRunAuditError: string | null = null;

  makerRuns: ReportRun[] = [];
  makerRunsError: string | null = null;

  checkerRuns: ReportRun[] = [];
  selectedCheckerRun: ReportRun | null = null;
  checkerDecision: 'APPROVED' | 'REJECTED' = 'APPROVED';
  checkerComment = '';
  checkerMessage: string | null = null;
  checkerError: string | null = null;

  checkerAudit: ReportAuditEvent[] = [];
  checkerAuditError: string | null = null;

  checkerHistoryRuns: ReportRun[] = [];
  checkerHistoryError: string | null = null;

  private readonly reportNameMap: Record<string, string> = {
    'Customer Transaction Analysis': '客户交易分析',
    'VIP Customer Revenue Report': 'VIP客户收入报告',
    'Merchant Performance Analysis': '商家绩效分析',
    'Department Budget Analysis': '部门预算分析',
    'Product Profitability Report': '产品盈利能力报告',
    'Customer Segmentation Analysis': '客户细分分析',
    'Monthly Revenue Trend Analysis': '月度收入趋势分析',
    'Order Fulfillment Analysis': '订单履行分析',
    'Employee Performance Metrics': '员工绩效指标',
    'Customer-Merchant Revenue Matrix': '客户商家收入矩阵',
    'Inventory Velocity Analysis': '库存周转分析',
    'Financial Health Scorecard': '财务健康仪表板'
  };

  private readonly reportDescriptionMap: Record<string, string> = {
    'Customer Transaction Analysis': '综合客户交易分析，包含信用评分关联和平均交易计算。',
    'VIP Customer Revenue Report': '详细 VIP 客户收入分析，包含账户余额和利润计算。',
    'Merchant Performance Analysis': '分析商家绩效指标，包含交易量、交易计数和佣金估算。',
    'Department Budget Analysis': '综合部门预算分析，对比分配预算与实际薪资成本及差异。',
    'Product Profitability Report': '详细产品盈利能力分析，包含销售量、收入、成本和利润率。',
    'Customer Segmentation Analysis': '基于交易行为、收入水平和价值分类的高级客户细分分析。',
    'Monthly Revenue Trend Analysis': '显示收入、支出和交易计数的月度趋势分析。',
    'Order Fulfillment Analysis': '跟踪订单量、订单价值和状态分布的订单履行分析。',
    'Employee Performance Metrics': '包含薪资分布和部门预算影响的员工绩效分析。',
    'Customer-Merchant Revenue Matrix': '展示客户与商家之间收入关系的交叉矩阵及排名指标。',
    'Inventory Velocity Analysis': '展示销售量和盈利能力指标的库存管理分析。',
    'Financial Health Scorecard': '用于高管视角的财务健康仪表板，汇总收入、支出、利润和客户指标。'
  };

  constructor(
    private reportService: ReportService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    this.refreshWorkbench();
  }

  get roleBadges(): string[] {
    const roleValue = this.authService.getCurrentUser()?.role ?? '';
    return roleValue.split(',').map((role) => role.trim()).filter(Boolean);
  }

  get workspaceTitle(): string {
    if (this.isRoute('/maker')) {
      return 'Maker 报表执行台';
    }
    if (this.isRoute('/checker')) {
      return 'Checker 审批工作台';
    }
    return '报表审批协作工作台';
  }

  get workspaceDescription(): string {
    if (this.isRoute('/maker')) {
      return '聚焦报表执行、当前运行状态、提交流转和导出结果，适合 Maker 角色连续操作。';
    }
    if (this.isRoute('/checker')) {
      return '聚焦待审批队列、审计轨迹和历史决策，适合 Checker 角色快速处理待办。';
    }
    return '将 Maker 与 Checker 的关键任务合并到一个统一工作台中，方便按角色切换处理业务。';
  }

  hasRole(role: string): boolean {
    return this.authService.getCurrentUser()?.role?.includes(role) ?? false;
  }

  isRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  refreshWorkbench(): void {
    this.loadReports();

    if (this.hasRole('MAKER')) {
      this.loadMakerRuns();
      if (this.selectedReport) {
        this.loadCurrentRunForSelectedReport();
      }
    }

    if (this.hasRole('CHECKER')) {
      this.loadCheckerRuns();
      this.loadCheckerHistory();
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'Generated':
        return '已生成';
      case 'Submitted':
        return '待审批';
      case 'Approved':
        return '已批准';
      case 'Rejected':
        return '已拒绝';
      default:
        return '未知';
    }
  }

  getStatusTone(status?: string): StatusTone {
    switch (status) {
      case 'Generated':
        return 'generated';
      case 'Submitted':
        return 'submitted';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'neutral';
    }
  }

  getChineseReportName(englishName: string): string {
    return this.reportNameMap[englishName] || englishName;
  }

  getChineseReportDescription(englishName: string): string {
    return this.reportDescriptionMap[englishName] || englishName;
  }

  loadReports(): void {
    this.error = null;

    this.reportService.getReports().subscribe({
      next: (data) => {
        this.reports = data;

        if (!this.selectedReport) {
          return;
        }

        const matchedReport = data.find((report) => report.id === this.selectedReport?.id) || null;
        this.selectedReport = matchedReport;

        if (!matchedReport) {
          this.reportData = null;
          this.currentRun = null;
          this.currentRunAudit = [];
          this.currentRunAuditError = null;
          return;
        }

        if (this.hasRole('MAKER')) {
          this.loadCurrentRunForSelectedReport();
        }
      },
      error: (err) => {
        this.reports = [];
        this.error = '加载报表列表失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  loadMakerRuns(): void {
    this.makerRunsError = null;

    this.reportService.getMyRuns().subscribe({
      next: (runs) => {
        this.makerRuns = this.sortRuns(runs, 'generatedAt');
      },
      error: (err) => {
        this.makerRunsError = '加载我的提交失败: ' + (err.error?.message || err.message || '');
        this.makerRuns = [];
      }
    });
  }

  loadCheckerRuns(): void {
    const previousRunId = this.selectedCheckerRun?.id;

    this.checkerError = null;

    this.reportService.getSubmittedRuns().subscribe({
      next: (runs) => {
        this.checkerRuns = this.sortRuns(runs, 'submittedAt');
        this.selectedCheckerRun = this.checkerRuns.find((run) => run.id === previousRunId) || this.checkerRuns[0] || null;

        if (this.selectedCheckerRun) {
          this.loadCheckerAudit();
          return;
        }

        this.checkerAudit = [];
        this.checkerAuditError = null;
      },
      error: (err) => {
        this.checkerRuns = [];
        this.selectedCheckerRun = null;
        this.checkerAudit = [];
        this.checkerAuditError = null;
        this.checkerError = '加载待审批报表失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  loadCheckerHistory(): void {
    this.checkerHistoryError = null;

    this.reportService.getCheckerHistoryRuns().subscribe({
      next: (runs) => {
        this.checkerHistoryRuns = this.sortRuns(runs, 'decidedAt');
      },
      error: (err) => {
        this.checkerHistoryError = '加载历史审批记录失败: ' + (err.error?.message || err.message || '');
        this.checkerHistoryRuns = [];
      }
    });
  }

  selectReport(reportId: string): void {
    if (!reportId) {
      this.selectedReport = null;
      this.reportData = null;
      this.currentRun = null;
      this.currentRunAudit = [];
      this.currentRunAuditError = null;
      this.submitMessage = null;
      this.submitError = null;
      this.exportError = null;
      return;
    }

    const report = this.reports.find((item) => item.id === Number(reportId));
    if (!report) {
      return;
    }

    this.selectedReport = report;
    this.reportData = null;
    this.error = null;
    this.exportError = null;
    this.submitMessage = null;
    this.submitError = null;
    this.currentRun = null;
    this.currentRunAudit = [];
    this.currentRunAuditError = null;

    if (this.hasRole('MAKER')) {
      this.loadCurrentRunForSelectedReport();
    }
  }

  runReport(): void {
    if (!this.selectedReport) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.exportError = null;

    this.reportService.executeReport(this.selectedReport.id).subscribe({
      next: (data) => {
        this.reportData = { data, count: data.length };
        this.loading = false;

        if (this.hasRole('MAKER')) {
          this.loadCurrentRunForSelectedReport();
          this.loadMakerRuns();
        }
      },
      error: (err) => {
        this.loading = false;
        this.reportData = null;
        this.error = '执行报表失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  submitCurrentRun(): void {
    if (!this.currentRun || this.currentRun.status !== 'Generated') {
      return;
    }

    this.submitMessage = null;
    this.submitError = null;

    this.reportService.submitRun(this.currentRun.id).subscribe({
      next: () => {
        this.submitMessage = '已提交审批';
        this.loadCurrentRunForSelectedReport();
        this.loadMakerRuns();

        if (this.hasRole('CHECKER')) {
          this.loadCheckerRuns();
        }
      },
      error: (err) => {
        this.submitError = '提交审批失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  selectCheckerRun(runId: string): void {
    if (!runId) {
      this.selectedCheckerRun = null;
      this.checkerAudit = [];
      this.checkerAuditError = null;
      return;
    }

    this.selectedCheckerRun = this.checkerRuns.find((run) => run.id === Number(runId)) || null;
    this.checkerComment = '';
    this.checkerMessage = null;
    this.checkerError = null;
    this.loadCheckerAudit();
  }

  decideSelectedRun(): void {
    if (!this.selectedCheckerRun) {
      return;
    }

    const selectedRun = this.selectedCheckerRun;

    this.checkerMessage = null;
    this.checkerError = null;

    this.reportService.decideRun(selectedRun.id, this.checkerDecision, this.checkerComment).subscribe({
      next: () => {
        this.checkerMessage = this.checkerDecision === 'APPROVED' ? '已批准' : '已拒绝';
        this.checkerComment = '';
        this.loadCheckerRuns();
        this.loadCheckerHistory();

        if (this.hasRole('MAKER')) {
          this.loadMakerRuns();

          if (this.selectedReport?.id === selectedRun.reportId) {
            this.loadCurrentRunForSelectedReport();
          }
        }
      },
      error: (err) => {
        this.checkerError = '审批操作失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  exportReport(): void {
    if (!this.selectedReport) {
      return;
    }

    this.exportError = null;

    this.reportService.downloadReport(this.selectedReport.id).subscribe({
      next: (blob) => {
        const fallbackName = 'report-' + this.selectedReport?.id;
        const baseName = this.getChineseReportName(this.selectedReport?.name || '') || fallbackName;
        this.triggerDownload(blob, baseName + '.xlsx');
      },
      error: (err) => {
        this.exportError = '导出失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  exportCurrentRun(): void {
    if (!this.currentRun) {
      return;
    }

    this.exportError = null;

    this.reportService.downloadRun(this.currentRun.id).subscribe({
      next: (blob) => {
        const fallbackName = 'report-run-' + this.currentRun?.id;
        const baseName = this.currentRun?.reportName || fallbackName;
        this.triggerDownload(blob, baseName + '.xlsx');
      },
      error: (err) => {
        this.exportError = '导出失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  exportRun(run: ReportRun): void {
    this.exportError = null;

    this.reportService.downloadRun(run.id).subscribe({
      next: (blob) => {
        const baseName = run.reportName || ('report-run-' + run.id);
        this.triggerDownload(blob, baseName + '.xlsx');
      },
      error: (err) => {
        this.exportError = '导出失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.reports = [];
    this.selectedReport = null;
    this.reportData = null;
    this.loading = false;
    this.error = null;
    this.exportError = null;
    this.currentRun = null;
    this.submitMessage = null;
    this.submitError = null;
    this.currentRunAudit = [];
    this.currentRunAuditError = null;
    this.makerRuns = [];
    this.makerRunsError = null;
    this.checkerRuns = [];
    this.selectedCheckerRun = null;
    this.checkerComment = '';
    this.checkerMessage = null;
    this.checkerError = null;
    this.checkerAudit = [];
    this.checkerAuditError = null;
    this.checkerHistoryRuns = [];
    this.checkerHistoryError = null;
    this.router.navigate(['/login']);
  }

  getKeys(data: ReportRow[]): string[] {
    if (!data || data.length === 0) {
      return [];
    }
    return Object.keys(data[0]);
  }

  viewRunFlow(runId: number): void {
    this.router.navigate(['/runs', runId, 'flow']);
  }

  private loadCurrentRunForSelectedReport(): void {
    if (!this.selectedReport) {
      return;
    }

    this.reportService.getMyLatestRun(this.selectedReport.id).subscribe({
      next: (run) => {
        this.currentRun = run;
        this.loadCurrentRunAudit();
      },
      error: () => {
        this.currentRun = null;
        this.currentRunAudit = [];
        this.currentRunAuditError = null;
      }
    });
  }

  private loadCurrentRunAudit(): void {
    if (!this.currentRun) {
      this.currentRunAudit = [];
      this.currentRunAuditError = null;
      return;
    }

    this.currentRunAuditError = null;

    this.reportService.getAuditTrail(this.currentRun.id).subscribe({
      next: (events) => {
        this.currentRunAudit = events;
      },
      error: (err) => {
        this.currentRunAudit = [];
        this.currentRunAuditError = '加载审计轨迹失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  private loadCheckerAudit(): void {
    if (!this.selectedCheckerRun) {
      this.checkerAudit = [];
      this.checkerAuditError = null;
      return;
    }

    this.checkerAuditError = null;

    this.reportService.getAuditTrail(this.selectedCheckerRun.id).subscribe({
      next: (events) => {
        this.checkerAudit = events;
      },
      error: (err) => {
        this.checkerAudit = [];
        this.checkerAuditError = '加载审计轨迹失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  private sortRuns(runs: ReportRun[], field: 'generatedAt' | 'submittedAt' | 'decidedAt'): ReportRun[] {
    return [...runs].sort((left, right) => this.getDateValue(right[field]) - this.getDateValue(left[field]));
  }

  private getDateValue(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }
}
