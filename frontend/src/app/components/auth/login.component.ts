import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface DemoAccount {
  username: string;
  password: string;
  roleLabel: string;
  description: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  readonly demoAccounts: DemoAccount[] = [
    {
      username: 'admin',
      password: '123456',
      roleLabel: 'MAKER + CHECKER',
      description: '适合完整演示执行、提交、审批、导出全链路。'
    },
    {
      username: 'maker1',
      password: '123456',
      roleLabel: 'MAKER',
      description: '专注报表执行、提交审批与历史追踪。'
    },
    {
      username: 'checker1',
      password: '123456',
      roleLabel: 'CHECKER',
      description: '专注待办审批、审计时间线与历史记录。'
    }
  ];

  username = '';
  password = '';
  loggingIn = false;
  loginError: string | null = null;
  private redirectUrl: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }

  useDemoAccount(account: DemoAccount): void {
    this.username = account.username;
    this.password = account.password;
    this.loginError = null;
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      return;
    }
    this.loggingIn = true;
    this.loginError = null;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loggingIn = false;
        this.goAfterLogin();
      },
      error: (err) => {
        this.loggingIn = false;
        this.loginError = '登录失败: ' + (err.error?.message || err.message || '');
      }
    });
  }

  switchAccount(): void {
    this.authService.logout();
    this.username = '';
    this.password = '';
    this.loginError = null;
    this.loggingIn = false;
  }

  goAfterLogin(): void {
    const user = this.authService.getCurrentUser();
    let defaultTarget = '/reports';
    const role = user?.role || '';
    if (role.includes('CHECKER')) {
      defaultTarget = '/checker';
    } else if (role.includes('MAKER')) {
      defaultTarget = '/maker';
    }
    const target = this.redirectUrl || defaultTarget;
    this.router.navigateByUrl(target);
  }
}
