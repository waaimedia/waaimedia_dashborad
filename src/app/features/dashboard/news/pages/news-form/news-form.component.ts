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
import {
  ArticleStatus,
  ENTERTAINMENT_SUBCATEGORIES,
  NEWS_CATEGORIES,
  NewsArticlePayload,
} from '../../data-access/news.model';

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
  protected readonly featuredImagePreview = signal('');
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
  protected readonly categories = NEWS_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  }));
  protected readonly entertainmentSubcategories = ENTERTAINMENT_SUBCATEGORIES.map(
    (subcategory) => ({
      label: subcategory,
      value: subcategory,
    }),
  );
  protected readonly isEntertainment = signal(false);
  protected readonly isArabic = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(180)]],
    arabicTitle: [''],
    description: [''],
    arabicDescription: [''],
    authorName: [''],
    arabicAuthorName: [''],
    isArabic: false,
    category: ['', Validators.required],
    subcategory: [''],
    content: ['', [Validators.required, Validators.minLength(20)]],
    arabicContent: [''],
  });

  private loadArticle(id: number): void {
    this.newsFacade.getById(id).subscribe({
      next: (article) => {
        this.articleId = article.id;
        this.isEditMode.set(true);
        this.imageName.set(article.imageName ?? '');
        const isArabic = article.isArabic ?? false;
        this.form.patchValue({
          title: isArabic ? '' : (article.title ?? ''),
          arabicTitle: article.arabicTitle ?? (isArabic ? (article.title ?? '') : ''),
          description: isArabic ? '' : (article.description ?? ''),
          arabicDescription:
            article.arabicDescription ?? (isArabic ? (article.description ?? '') : ''),
          authorName: isArabic ? '' : (article.authorName ?? ''),
          arabicAuthorName: article.arabicAuthorName ?? (isArabic ? (article.authorName ?? '') : ''),
          category: article.category ?? '',
          subcategory: article.subcategory ?? '',
          content: isArabic ? '' : (article.content ?? ''),
          arabicContent: article.arabicContent ?? (isArabic ? (article.content ?? '') : ''),
          isArabic,
        });
        this.contentPreview.set(
          isArabic ? (article.arabicContent ?? article.content ?? '') : (article.content ?? ''),
        );
      },
      error: () => this.router.navigateByUrl('/dashboard/news'),
    });
  }

  ngOnInit(): void {
    this.form.controls.category.valueChanges.subscribe((category) => {
      this.updateSubcategoryControl(category);
    });
    this.form.controls.isArabic.valueChanges.subscribe((isArabic) => {
      this.updateArabicControls(isArabic);
    });
    this.updateSubcategoryControl(this.form.controls.category.value);
    this.updateArabicControls(this.form.controls.isArabic.value);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);

    this.isEditMode.set(isEditing);
    if (id !== null && Number.isFinite(id)) {
      this.loadArticle(id);
    }

    this.header.showNewsForm(this.isEditMode());
  }

  private updateSubcategoryControl(category: string): void {
    const subcategoryControl = this.form.controls.subcategory;
    const isEntertainment = !this.isArabic() && category === 'Entertainment';

    this.isEntertainment.set(isEntertainment);
    subcategoryControl.setValidators(isEntertainment ? [Validators.required] : []);
    if (!isEntertainment) {
      subcategoryControl.setValue('', { emitEvent: false });
    }
    subcategoryControl.updateValueAndValidity({ emitEvent: false });
  }

  private updateArabicControls(isArabic: boolean): void {
    const categoryControl = this.form.controls.category;
    const subcategoryControl = this.form.controls.subcategory;
    const titleControl = this.form.controls.title;
    const contentControl = this.form.controls.content;
    const arabicTitleControl = this.form.controls.arabicTitle;
    const arabicContentControl = this.form.controls.arabicContent;

    this.isArabic.set(isArabic);
    if (isArabic) {
      this.isEntertainment.set(false);
      categoryControl.clearValidators();
      subcategoryControl.clearValidators();
      titleControl.clearValidators();
      contentControl.clearValidators();
      arabicTitleControl.setValidators([Validators.required, Validators.maxLength(180)]);
      arabicContentControl.setValidators([Validators.required, Validators.minLength(20)]);
      subcategoryControl.updateValueAndValidity({ emitEvent: false });
    } else {
      categoryControl.setValidators([Validators.required]);
      titleControl.setValidators([Validators.required, Validators.maxLength(180)]);
      contentControl.setValidators([Validators.required, Validators.minLength(20)]);
      arabicTitleControl.clearValidators();
      arabicContentControl.clearValidators();
      this.updateSubcategoryControl(categoryControl.value);
    }
    categoryControl.updateValueAndValidity({ emitEvent: false });
    titleControl.updateValueAndValidity({ emitEvent: false });
    contentControl.updateValueAndValidity({ emitEvent: false });
    arabicTitleControl.updateValueAndValidity({ emitEvent: false });
    arabicContentControl.updateValueAndValidity({ emitEvent: false });
    this.contentPreview.set(isArabic ? arabicContentControl.value : contentControl.value);
  }

  protected isActiveTitleInvalid(): boolean {
    const control = this.isArabic() ? this.form.controls.arabicTitle : this.form.controls.title;
    return control.invalid && control.touched;
  }

  protected isActiveContentInvalid(): boolean {
    const control = this.isArabic() ? this.form.controls.arabicContent : this.form.controls.content;
    return control.invalid && control.touched;
  }

  protected async selectImage(event: Event): Promise<void> {
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

    try {
      const preview = await this.fileToDataUrl(file);
      this.imageName.set(file.name);
      this.featuredImagePreview.set(preview);
    } catch {
      this.messages.add({
        severity: 'error',
        summary: 'Image preview unavailable',
        detail: 'The selected image could not be read. Please try another image.',
        life: 3500,
      });
    }
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

    const validImages = files.filter(
      (file) =>
        ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) &&
        file.size <= 5 * 1024 * 1024,
    );

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
    console.log("Saving news article..." , this.form.value);

    if (status === 'Published' && this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Complete the required fields',
        detail: this.isArabic()
          ? 'News title and article content are required before saving.'
          : 'News title, category, and article content are required before saving.',
        life: 3500,
      });
      return;
    }

    const {
      isArabic,
      title,
      arabicTitle,
      description,
      arabicDescription,
      authorName,
      arabicAuthorName,
      category,
      subcategory,
      content,
      arabicContent,
    } = this.form.getRawValue();
    const payload: NewsArticlePayload = {
      isArabic,
      ...(isArabic
        ? { arabicTitle, arabicDescription, arabicAuthorName, arabicContent }
        : {
            title,
            description,
            authorName,
            content,
            category,
            ...(this.isEntertainment() ? { subcategory } : {}),
            imageName: this.imageName(),
          }),
      status,
    };
    const request =
      this.articleId !== null
        ? this.newsFacade.update(this.articleId, payload)
        : this.newsFacade.create(payload);

    request.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEditMode() ? 'News updated' : 'News created',
          detail:
            status === 'Published'
              ? 'Your news article has been published.'
              : 'Your news article was saved as a draft.',
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
