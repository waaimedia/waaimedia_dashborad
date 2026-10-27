import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { UserFacade } from '../../data-access/user.facade';
import { DashboardUser } from '../../data-access/user.model';

@Component({ selector: 'app-users-management', imports: [RouterLink, PaginationComponent], templateUrl: './users-management.component.html', styleUrl: './users-management.component.scss' })
export class UsersManagementComponent implements OnInit {
  private readonly facade = inject(UserFacade); private readonly header = inject(DashboardHeaderService); private readonly router = inject(Router); private readonly confirmation = inject(ConfirmationService); private readonly messages = inject(MessageService); private readonly auth = inject(AuthService);
  protected readonly page = signal(1); protected readonly pageSize = 15; protected readonly users = this.facade.users; protected readonly totalRecords = this.facade.totalRecords;
  ngOnInit(): void { this.header.showUsersList(); this.loadPage(1); }
  protected addUser(): void { void this.router.navigateByUrl('/dashboard/users/new'); }
  protected changePage(page: number): void { if (Number.isInteger(page) && page > 0) this.loadPage(page); }
  protected canManage(user: DashboardUser): boolean { return this.auth.canManageUser(user.role); }
  protected deleteUser(user: DashboardUser): void {
    if (!this.canManage(user)) return;
    this.confirmation.confirm({ header: 'Delete user?', message: `“${user.name}” will be permanently removed.`, acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptButtonStyleClass: 'p-button-danger', accept: () => this.facade.remove(user.id).subscribe({ next: () => { this.loadPage(1); this.messages.add({ severity: 'success', summary: 'User deleted', detail: 'The user has been removed successfully.', life: 3500 }); } }) });
  }
  private loadPage(page: number): void { this.page.set(page); this.facade.load({ page, pageSize: this.pageSize }).subscribe(); }
}
