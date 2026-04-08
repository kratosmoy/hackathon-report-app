import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportAuditEvent, ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-run-flow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flow-page">
      <section class="flow-hero">
        <div>
          <p class="eyebrow">Audit Timeline</p>
          <h1>报表审批流程 · Run #{{ runId }}</h1>
          <p>从生成、提交到审批，所有关键审计事件都在同一条时间线上展示。</p>
        </div>

        <div class="action-row">
          <button class="btn btn-ghost" type="button" (click)="goBack()">返回工作台</button>
        </div>
      </section>

      <div *ngIf="loading" class="workspace-card">
        <div class="empty-state">
          <h3>加载审批流程中</h3>
          <p>正在同步这次运行的完整审计信息。</p>
        </div>
      </div>

      <div *ngIf="error" class="banner banner--danger">{{ error }}</div>

      <section *ngIf="!loading && !error" class="stack">
        <div class="insight-grid insight-grid--compact">
          <article class="insight-card">
            <span class="insight-card__label">审计事件数</span>
            <strong>{{ events.length }}</strong>
            <p>完整记录本次运行的所有状态变化。</p>
          </article>

          <article class="insight-card">
            <span class="insight-card__label">最新节点</span>
            <strong>{{ events.length > 0 ? getEventLabel(events[0].eventType) : '暂无' }}</strong>
            <p>帮助现场演示时快速说明当前阶段。</p>
          </article>
        </div>

        <article class="workspace-card" *ngIf="events.length === 0">
          <div class="empty-state">
            <h3>暂无审计记录</h3>
            <p>当前运行还没有可展示的流程事件。</p>
          </div>
        </article>

        <article class="workspace-card" *ngIf="events.length > 0">
          <div class="card-heading">
            <h3>流程时间线</h3>
            <span class="soft-tag">按时间倒序展示</span>
          </div>

          <ol class="timeline-list">
            <li *ngFor="let event of events" class="timeline-item">
              <div class="timeline-item__marker" [attr.data-tone]="getEventTone(event.eventType)"></div>
              <div class="timeline-item__content">
                <div class="timeline-item__header">
                  <div>
                    <p class="timeline-item__time">{{ event.eventTime | date:'yyyy-MM-dd HH:mm:ss' }}</p>
                    <h3>{{ getEventLabel(event.eventType) }}</h3>
                  </div>
                  <span class="status-pill" [attr.data-tone]="getEventTone(event.eventType)">
                    {{ event.eventType }}
                  </span>
                </div>

                <div class="timeline-item__meta">
                  <span>用户：{{ event.actorUsername || '-' }}</span>
                  <span>角色：{{ event.actorRole || '-' }}</span>
                  <span>报表 ID：{{ event.reportId }}</span>
                </div>

                <p *ngIf="event.comment" class="timeline-item__comment">备注：{{ event.comment }}</p>
              </div>
            </li>
          </ol>
        </article>
      </section>
    </div>
  `
})
export class ReportRunFlowComponent implements OnInit {
  runId!: number;
  events: ReportAuditEvent[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error = '缺少 runId 参数';
      return;
    }
    this.runId = +idParam;
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;
    this.reportService.getAuditTrail(this.runId).subscribe({
      next: (events) => {
        this.events = [...events].sort(
          (left, right) => new Date(right.eventTime).getTime() - new Date(left.eventTime).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = '加载审批流程失败: ' + (err.error?.message || err.message || '');
        this.loading = false;
      }
    });
  }

  getEventLabel(eventType: string): string {
    switch (eventType) {
      case 'RUN_GENERATED':
        return '报表已生成';
      case 'RUN_SUBMITTED':
        return '已提交审批';
      case 'RUN_APPROVED':
        return '审批已通过';
      case 'RUN_REJECTED':
        return '审批已驳回';
      default:
        return eventType;
    }
  }

  getEventTone(eventType: string): 'generated' | 'submitted' | 'approved' | 'rejected' | 'neutral' {
    switch (eventType) {
      case 'RUN_GENERATED':
        return 'generated';
      case 'RUN_SUBMITTED':
        return 'submitted';
      case 'RUN_APPROVED':
        return 'approved';
      case 'RUN_REJECTED':
        return 'rejected';
      default:
        return 'neutral';
    }
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }
}
