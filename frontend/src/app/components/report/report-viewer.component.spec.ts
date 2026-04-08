import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { ReportViewerComponent } from './report-viewer.component';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';

describe('ReportViewerComponent', () => {
  let component: ReportViewerComponent;
  let fixture: ComponentFixture<ReportViewerComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'getCurrentUser',
      'logout'
    ]);
    reportServiceSpy = jasmine.createSpyObj<ReportService>('ReportService', [
      'getReports',
      'getMyRuns',
      'getSubmittedRuns',
      'getCheckerHistoryRuns',
      'getAuditTrail',
      'getMyLatestRun',
      'submitRun',
      'decideRun',
      'executeReport',
      'downloadReport',
      'downloadRun'
    ]);

    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getCurrentUser.and.returnValue(null);
    reportServiceSpy.getReports.and.returnValue(of([]));
    reportServiceSpy.getMyRuns.and.returnValue(of([]));
    reportServiceSpy.getSubmittedRuns.and.returnValue(of([]));
    reportServiceSpy.getCheckerHistoryRuns.and.returnValue(of([]));
    reportServiceSpy.getAuditTrail.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReportViewerComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('detects whether the current user has a role', () => {
    authServiceSpy.getCurrentUser.and.returnValue({
      id: 1,
      username: 'maker1',
      role: 'MAKER,CHECKER'
    });

    expect(component.hasRole('MAKER')).toBeTrue();
    expect(component.hasRole('CHECKER')).toBeTrue();
    expect(component.hasRole('ADMIN')).toBeFalse();
  });

  it('maps known statuses to localized labels', () => {
    expect(component.getStatusLabel('Generated')).toBe('已生成');
    expect(component.getStatusLabel('Submitted')).toBe('待审批');
    expect(component.getStatusLabel('Approved')).toBe('已批准');
    expect(component.getStatusLabel('Rejected')).toBe('已拒绝');
    expect(component.getStatusLabel(undefined)).toBe('未知');
  });

  it('maps statuses to presentation tones with a neutral fallback', () => {
    expect(component.getStatusTone('Generated')).toBe('generated');
    expect(component.getStatusTone('Submitted')).toBe('submitted');
    expect(component.getStatusTone('Approved')).toBe('approved');
    expect(component.getStatusTone('Rejected')).toBe('rejected');
    expect(component.getStatusTone('Unexpected')).toBe('neutral');
  });

  it('loads audit details for the first checker run when the list is refreshed', () => {
    authServiceSpy.getCurrentUser.and.returnValue({
      id: 2,
      username: 'checker1',
      role: 'CHECKER'
    });
    reportServiceSpy.getSubmittedRuns.and.returnValue(of([
      {
        id: 9,
        reportId: 1,
        reportName: 'Customer Transaction Analysis',
        status: 'Submitted',
        makerUsername: 'maker1',
        generatedAt: '2026-04-08T10:00:00',
        submittedAt: '2026-04-08T10:01:00'
      }
    ]));

    component.loadCheckerRuns();

    expect(component.selectedCheckerRun?.id).toBe(9);
    expect(reportServiceSpy.getAuditTrail).toHaveBeenCalledWith(9);
  });

  it('clears loading state and shows a localized error when report execution fails', () => {
    component.reports = [
      {
        id: 3,
        name: 'Customer Transaction Analysis',
        sql: 'select 1',
        description: 'demo'
      }
    ];
    component.selectReport('3');
    reportServiceSpy.executeReport.and.returnValue(throwError(() => new Error('network')));

    component.runReport();

    expect(component.loading).toBeFalse();
    expect(component.error).toContain('执行报表失败');
  });
});
