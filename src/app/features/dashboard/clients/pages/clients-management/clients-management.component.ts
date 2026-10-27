import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { ClientFacade } from '../../data-access/client.facade';
import { Client } from '../../data-access/client.model';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-clients-management',
  imports: [RouterLink, PaginationComponent],
  templateUrl: './clients-management.component.html',
  styleUrl: './clients-management.component.scss',
})
export class ClientsManagementComponent implements OnInit {
  private readonly facade = inject(ClientFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);

  protected readonly page = signal(1);
  protected readonly pageSize = 4;
  protected readonly clients = this.facade.clients;
  protected readonly canDelete = () => this.auth.canDeleteContent();
  protected readonly paginatedClients = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.clients().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.header.showClientsList();
    this.facade.load().subscribe();
  }

  protected addClient(): void {
    this.router.navigateByUrl('/dashboard/clients/new');
  }

  protected changePage(page: number): void {
    this.page.set(page);
  }

  protected deleteClient(client: Client): void {
    if (!this.auth.canDeleteContent()) return;
    this.confirmation.confirm({
      header: 'Delete client?',
      message: `“${client.fullName}” will be permanently removed from your clients.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(client.id).subscribe({
          next: () => {
            this.page.set(1);
            this.messages.add({
              severity: 'success',
              summary: 'Client deleted',
              detail: 'The client has been removed successfully.',
              life: 3500,
            });
          },
        });
      },
    });
  }
}
