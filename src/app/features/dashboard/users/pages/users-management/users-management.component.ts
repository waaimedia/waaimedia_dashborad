import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { UserFacade } from '../../data-access/user.facade';
import { DashboardUser } from '../../data-access/user.model';

@Component({ selector: 'app-users-management', imports: [RouterLink, PaginationComponent], templateUrl: './users-management.component.html', styleUrl: './users-management.component.scss' })
export class UsersManagementComponent implements OnInit {
  private readonly facade = inject(UserFacade); private readonly header = inject(DashboardHeaderService); private readonly router = inject(Router); private readonly confirmation = inject(ConfirmationService); private readonly messages = inject(MessageService);
  protected readonly page = signal(1); protected readonly pageSize = 8; protected readonly users = this.facade.users;
  protected readonly paginatedUsers = computed(() => { const start = (this.page() - 1) * this.pageSize; return this.users().slice(start, start + this.pageSize); });
  ngOnInit(): void { this.header.showUsersList(); this.facade.load().subscribe(); }
  protected addUser(): void { this.router.navigateByUrl('/dashboard/users/new'); }
  protected changePage(page: number): void { this.page.set(page); }
  protected deleteUser(user: DashboardUser): void { this.confirmation.confirm({ header: 'Delete user?', message: `“${user.name}” will be permanently removed.`, acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptButtonStyleClass: 'p-button-danger', accept: () => this.facade.remove(user.id).subscribe(() => { this.page.set(1); this.messages.add({ severity: 'success', summary: 'User deleted', detail: 'The user has been removed successfully.', life: 3500 }); }) }); }
}
