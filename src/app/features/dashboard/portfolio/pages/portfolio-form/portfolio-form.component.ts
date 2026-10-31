import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { PortfolioFacade } from '../../data-access/portfolio.facade';
import { PortfolioItem, PortfolioItemPayload, PortfolioKind, PortfolioMediaPayload, PortfolioStatus } from '../../data-access/portfolio.model';

interface DraftMedia extends PortfolioMediaPayload { previewUrl?: string; fileName?: string; }

@Component({
  selector: 'app-portfolio-form',
  imports: [ReactiveFormsModule, Select],
  templateUrl: './portfolio-form.component.html',
  styleUrl: './portfolio-form.component.scss',
})
export class PortfolioFormComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly portfolioFacade = inject(PortfolioFacade);

  private itemId: number | string | null = null;
  private readonly originalItem = signal<PortfolioItem | null>(null);
  private readonly coverImage = signal<File | undefined>(undefined);
  private readonly featuredImage = signal<File | undefined>(undefined);
  protected readonly pendingMedia = signal<DraftMedia[]>([]);
  private readonly removedMediaIds = signal<number[]>([]);
  private readonly selectedCategoryId = signal(0);
  private readonly selectedSubcategoryId = signal(0);
  protected readonly isEditMode = signal(false);
  protected readonly coverName = signal('');
  protected readonly featuredImageName = signal('');
  protected readonly coverPreviewUrl = signal<string | null>(null);
  protected readonly featuredPreviewUrl = signal<string | null>(null);
  protected readonly categories = this.portfolioFacade.categories;
  protected readonly clients = this.portfolioFacade.clients;
  protected readonly form = this.formBuilder.nonNullable.group({
    clientId: [0, [Validators.required, Validators.min(1)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    subcategoryId: [0],
    titleEn: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/.*[A-Za-z0-9].*/)]],
    titleAr: ['', Validators.maxLength(255)],
    linkOne: ['', Validators.pattern(/^https?:\/\/.+/i)],
    linkTwo: ['', Validators.pattern(/^https?:\/\/.+/i)],
    linkThree: ['', Validators.pattern(/^https?:\/\/.+/i)],
    confirmMediaReset: [false],
  });
  protected readonly subcategories = computed(() => this.categories().find((category) => category.id === this.selectedCategoryId())?.subcategories ?? []);
  protected readonly kind = computed<PortfolioKind | null>(() => {
    const category = this.categories().find((candidate) => candidate.id === this.selectedCategoryId());
    if (!category) return null;
    return category.subcategories.find((child) => child.id === this.selectedSubcategoryId())?.kind ?? category.kind ?? null;
  });
  protected readonly existingMedia = computed(() => this.originalItem()?.media.filter((media) => !this.removedMediaIds().includes(media.id)) ?? []);
  protected readonly existingCoverUrl = computed(() => this.originalItem()?.coverImageUrl ?? null);
  protected readonly existingFeaturedUrl = computed(() => this.originalItem()?.media[0]?.imageUrl ?? null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);
    this.isEditMode.set(isEditing);
    this.header.showPortfolioForm(isEditing);
    this.portfolioFacade.loadFormOptions().subscribe();
    this.portfolioFacade.loadClients().subscribe();
    if (isEditing && id !== null) this.loadItem(id);
    this.form.controls.categoryId.valueChanges.subscribe((categoryId) => {
      this.selectedCategoryId.set(categoryId);
      this.form.controls.subcategoryId.setValue(0);
    });
    this.form.controls.subcategoryId.valueChanges.subscribe((subcategoryId) => this.selectedSubcategoryId.set(subcategoryId));
  }

  ngOnDestroy(): void {
    this.revokePreview(this.coverPreviewUrl());
    this.revokePreview(this.featuredPreviewUrl());
    this.pendingMedia().forEach((media) => this.revokePreview(media.previewUrl));
  }

  protected selectCover(event: Event): void { this.setImage(event, (file) => { this.replacePreview(this.coverPreviewUrl, file); this.coverImage.set(file); this.coverName.set(file.name); }); }
  protected selectFeaturedImage(event: Event): void { this.setImage(event, (file) => { this.replacePreview(this.featuredPreviewUrl, file); this.featuredImage.set(file); this.featuredImageName.set(file.name); }); }

  protected addMedia(): void { this.pendingMedia.update((media) => [...media, {}]); }
  protected removePendingMedia(index: number): void { this.pendingMedia.update((media) => { this.revokePreview(media[index]?.previewUrl); return media.filter((_, itemIndex) => itemIndex !== index); }); }
  protected removeExistingMedia(id: number): void { this.removedMediaIds.update((ids) => [...ids, id]); }
  protected setMediaFile(index: number, event: Event): void {
    this.setImage(event, (file) => this.pendingMedia.update((media) => media.map((entry, itemIndex) => {
      if (itemIndex !== index) return entry;
      this.revokePreview(entry.previewUrl);
      return { ...entry, image: file, fileName: file.name, previewUrl: URL.createObjectURL(file) };
    })));
  }
  protected setMediaUrl(index: number, url: string): void { this.pendingMedia.update((media) => media.map((entry, itemIndex) => itemIndex === index ? { ...entry, url } : entry)); }
  protected needsImage(): boolean { return this.kind() === 'images' || this.kind() === 'images_with_url'; }
  protected needsMediaUrl(): boolean { return this.kind() === 'video_urls' || this.kind() === 'images_with_url'; }
  protected isWebDesign(): boolean { return this.kind() === 'web_design'; }

  protected save(status: PortfolioStatus): void {
    if (this.form.invalid || (status === 'published' && !this.form.controls.titleAr.value.trim())) {
      this.form.markAllAsTouched();
      this.messages.add({ severity: 'warn', summary: 'Complete required fields', detail: status === 'published' ? 'English and Arabic titles are required to publish.' : 'Client, category and English title are required.', life: 4000 });
      return;
    }
    if (this.subcategories().length && !this.form.controls.subcategoryId.value) {
      this.messages.add({ severity: 'warn', summary: 'Select a subcategory', detail: 'This category requires a subcategory, including drafts.', life: 4000 });
      return;
    }

    const values = this.form.getRawValue();
    const payload: PortfolioItemPayload = {
      clientId: values.clientId, categoryId: values.categoryId, subcategoryId: values.subcategoryId || null,
      titleEn: values.titleEn, titleAr: values.titleAr, status, coverImage: this.coverImage(), featuredImage: this.featuredImage(),
      linkOne: values.linkOne, linkTwo: values.linkTwo, linkThree: values.linkThree,
      media: this.pendingMedia(), removeMediaIds: this.removedMediaIds(), confirmMediaReset: values.confirmMediaReset,
    };
    const request = this.itemId !== null ? this.portfolioFacade.update(this.itemId, payload) : this.portfolioFacade.create(payload);
    request.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'Portfolio item updated' : 'Portfolio item created', detail: status === 'published' ? 'Your portfolio item has been published.' : 'Your portfolio item was saved as a draft.', life: 3500 });
        this.router.navigateByUrl('/dashboard/portfolio');
      },
    });
  }

  protected cancel(): void { this.router.navigateByUrl('/dashboard/portfolio'); }

  private loadItem(id: number): void {
    this.portfolioFacade.getById(id).subscribe({
      next: (item) => {
        this.itemId = item.id; this.originalItem.set(item); this.selectedCategoryId.set(item.categoryId); this.selectedSubcategoryId.set(item.subcategoryId ?? 0); this.coverName.set(item.coverImageUrl ? 'Current cover image' : '');
        this.form.patchValue({ clientId: item.clientId, categoryId: item.categoryId, subcategoryId: item.subcategoryId ?? 0, titleEn: item.titleEn, titleAr: item.titleAr ?? '', linkOne: item.linkOne ?? '', linkTwo: item.linkTwo ?? '', linkThree: item.linkThree ?? '' });
      },
      error: () => this.router.navigateByUrl('/dashboard/portfolio'),
    });
  }

  private setImage(event: Event, apply: (file: File) => void): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      this.messages.add({ severity: 'warn', summary: 'Invalid image', detail: 'Use a PNG or JPG image up to 10MB.', life: 3500 });
      return;
    }
    apply(file);
  }

  private replacePreview(target: ReturnType<typeof signal<string | null>>, file: File): void {
    this.revokePreview(target());
    target.set(URL.createObjectURL(file));
  }

  private revokePreview(url?: string | null): void {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }
}
