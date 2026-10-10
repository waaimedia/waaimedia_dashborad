import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { MessageService } from 'primeng/api';
import { Editor, EditorInitEvent, EditorTextChangeEvent } from 'primeng/editor';
import { Select } from 'primeng/select';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { NewsFacade } from '../../data-access/news.facade';
import { ArticleStatus, NewsArticlePayload } from '../../data-access/news.model';

@Component({
  selector: 'app-news-form',
  imports: [ReactiveFormsModule, Select, Editor],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.scss',
})
export class NewsFormComponent implements OnInit {
  @ViewChild('contentImageInput') private contentImageInput?: ElementRef<HTMLInputElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly newsFacade = inject(NewsFacade);

  private articleId: number | string | null = null;
  private editor: any;
  protected readonly isEditMode = signal(false);
  protected readonly imageName = signal('');
  protected readonly contentPreview = signal('');
  protected readonly previewHtml = computed(() => {
    const content = this.contentPreview();
    if (!content) {
      return '';
    }

    const sanitizedContent = DOMPurify.sanitize(content, {
      ADD_ATTR: ['target'],
    });

    return this.sanitizer.bypassSecurityTrustHtml(sanitizedContent);
  });
  protected readonly categories = [
    { label: 'Technology', value: 'Technology' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Business', value: 'Business' },
    { label: 'Culture', value: 'Culture' },
  ];
  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(180)]],
    category: ['', Validators.required],
    linkOne: [''],
    linkTwo: [''],
    content: ['', [Validators.required, Validators.minLength(20)]],
  });

  private loadArticle(id: number): void {
    this.newsFacade.getById(id).subscribe({
      next: (article) => {
        this.articleId = article.id;
        this.isEditMode.set(true);
        this.imageName.set(article.imageName ?? '');
        this.form.patchValue({
          title: article.title,
          category: article.category,
          linkOne: article.linkOne ?? '',
          linkTwo: article.linkTwo ?? '',
          content: article.content ?? '',
        });
        this.contentPreview.set(article.content ?? '');
      },
      error: () => this.router.navigateByUrl('/dashboard/news'),
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);

    this.isEditMode.set(isEditing);
    if (id !== null && Number.isFinite(id)) {
      this.loadArticle(id);
    }

    this.header.showNewsForm(this.isEditMode());
  }

  protected selectImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      this.messages.add({
        severity: 'warn',
        summary: 'Invalid image',
        detail: 'Use a PNG or JPG image up to 10MB.',
        life: 3500,
      });
      return;
    }

    this.imageName.set(file.name);
  }

  protected onEditorInit(event: EditorInitEvent): void {
    this.editor = event.editor;
    const toolbar = this.editor.getModule('toolbar');

    toolbar.addHandler('image', () => this.contentImageInput?.nativeElement.click());
  }

  protected updateContentPreview(event: EditorTextChangeEvent): void {
    this.contentPreview.set(event.htmlValue ?? '');
  }

  protected selectContentImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    const validImages = files.filter((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024);

    if (validImages.length !== files.length) {
      this.messages.add({
        severity: 'warn',
        summary: 'Some images were skipped',
        detail: 'Use PNG, JPG, or WEBP files up to 5MB each.',
        life: 4000,
      });
    }

    if (!validImages.length || !this.editor) {
      return;
    }

    void this.insertContentImages(validImages);
  }

  private async insertContentImages(files: File[]): Promise<void> {
    for (const file of files) {
      const imageUrl = await this.fileToDataUrl(file);
      const range = this.editor.getSelection(true) ?? { index: this.editor.getLength(), length: 0 };

      this.editor.insertEmbed(range.index, 'image', imageUrl, 'user');
      this.editor.setSelection(range.index + 1, 0, 'silent');
    }
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  protected save(status: ArticleStatus): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Complete the required fields',
        detail: 'News title, category, and article content are required before saving.',
        life: 3500,
      });
      return;
    }

    const payload: NewsArticlePayload = {
      ...this.form.getRawValue(),
      imageName: this.imageName(),
      status,
    };
    const request = this.articleId !== null
      ? this.newsFacade.update(this.articleId, payload)
      : this.newsFacade.create(payload);

    request.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEditMode() ? 'News updated' : 'News created',
          detail: status === 'Published' ? 'Your news article has been published.' : 'Your news article was saved as a draft.',
          life: 3500,
        });
        this.router.navigateByUrl('/dashboard/news');
      },
    });
  }

  protected cancel(): void {
    this.router.navigateByUrl('/dashboard/news');
  }
}
