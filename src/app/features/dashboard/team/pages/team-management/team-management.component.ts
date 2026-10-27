import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { TeamFacade } from '../../data-access/team.facade';
import { TeamMember } from '../../data-access/team.model';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-team-management',
  imports: [RouterLink, PaginationComponent],
  templateUrl: './team-management.component.html',
  styleUrl: './team-management.component.scss',
})
export class TeamManagementComponent implements OnInit {
  private readonly facade = inject(TeamFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly members = this.facade.members;
  protected readonly totalRecords = this.facade.totalRecords;
  protected readonly canDelete = () => this.auth.hasRole('super_admin', 'admin');

  ngOnInit(): void {
    this.header.showTeamList();
    this.loadPage(1);
  }

  protected addMember(): void {
    this.router.navigateByUrl('/dashboard/team/new');
  }

  protected changePage(page: number): void {
    if (!Number.isInteger(page) || page < 1) return;
    this.loadPage(page);
  }

  protected deleteMember(member: TeamMember): void {
    if (!this.canDelete()) return;
    this.confirmation.confirm({
      header: 'Delete team member?',
      message: `“${member.fullName}” will be permanently removed from the team.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(member.id).subscribe({
          next: () => {
            this.loadPage(1);
            this.messages.add({
              severity: 'success',
              summary: 'Member deleted',
              detail: 'The team member has been removed successfully.',
              life: 3500,
            });
          },
        });
      },
    });
  }

  private loadPage(page: number): void {
    this.page.set(page);
    this.facade.load({ page, pageSize: this.pageSize }).subscribe();
  }
}
