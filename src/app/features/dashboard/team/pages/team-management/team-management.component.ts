import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  protected readonly pageSize = 4;
  protected readonly members = this.facade.members;
  protected readonly canDelete = () => this.auth.hasRole('admin');
  protected readonly paginatedMembers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.members().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.header.showTeamList();
    this.facade.load().subscribe();
  }

  protected addMember(): void {
    this.router.navigateByUrl('/dashboard/team/new');
  }

  protected changePage(page: number): void {
    this.page.set(page);
  }

  protected deleteMember(member: TeamMember): void {
    if (!this.auth.hasRole('admin')) return;
    this.confirmation.confirm({
      header: 'Delete team member?',
      message: `“${member.fullName}” will be permanently removed from the team.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(member.id).subscribe({
          next: () => {
            this.page.set(1);
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
}
