import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Editor, EditorInitEvent } from 'primeng/editor';
import { Select } from 'primeng/select';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { BlogFacade } from '../../data-access/blog.facade';
import { BlogCategory, BlogPostPayload, BlogStatus } from '../../data-access/blog.model';

type EditorLanguage = 'en' | 'ar';

@Component({ selector: 'app-blog-form', imports: [ReactiveFormsModule, Select, Editor], templateUrl: './blog-form.component.html', styleUrl: './blog-form.component.scss' })
export class BlogFormComponent implements OnInit {
  @ViewChild('englishImageInput') private englishImageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('arabicImageInput') private arabicImageInput?: ElementRef<HTMLInputElement>;
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly facade = inject(BlogFacade);
  private postId: number | string | null = null;
  private currentStatus: BlogStatus = 'draft';
  private featuredImage?: File;
  private featuredImageId: number | null = null;
  private readonly editors: Partial<Record<EditorLanguage, any>> = {};
  protected readonly isEditMode = signal(false);
  protected readonly imageName = signal('');
  protected readonly featuredImagePreview = signal('');
  protected readonly uploadingEditorImage = signal(false);
  protected readonly categoryOptions = signal<Array<{ label: string; value: number }>>([]);
  protected readonly form = this.formBuilder.nonNullable.group({ titleEn: [''], titleAr: [''], authorNameEn: [''], authorNameAr: [''], shortDescriptionEn: [''], shortDescriptionAr: [''], contentEn: [''], contentAr: [''], categoryId: 0 });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const editing = Number.isFinite(id) && id > 0;
    this.isEditMode.set(editing);
    this.header.showBlogForm(editing);
    this.facade.loadCategories().subscribe({ next: (categories) => this.categoryOptions.set(this.toLeafOptions(categories)) });
    if (editing) this.loadPost(id);
  }

  protected async selectFeaturedImage(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.isValidImage(file)) { this.showInvalidImage(); return; }
    this.featuredImage = file; this.imageName.set(file.name); this.featuredImagePreview.set(URL.createObjectURL(file));
  }
  protected onEditorInit(language: EditorLanguage, event: EditorInitEvent): void { this.editors[language] = event.editor; }
  protected chooseEditorImage(language: EditorLanguage): void { (language === 'en' ? this.englishImageInput : this.arabicImageInput)?.nativeElement.click(); }
  protected async selectEditorImages(language: EditorLanguage, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []); input.value = '';
    const validFiles = files.filter((file) => this.isValidImage(file));
    if (validFiles.length !== files.length) this.showInvalidImage();
    if (!validFiles.length || !this.editors[language]) return;
    this.uploadingEditorImage.set(true);
    try { for (const file of validFiles) { const image = await firstValueFrom(this.facade.uploadImage(file, 'editor')); this.insertEditorImage(language, image.id, image.url); } }
    finally { this.uploadingEditorImage.set(false); }
  }

  protected async save(status: BlogStatus): Promise<void> {
    const value = this.form.getRawValue();
    if (!value.categoryId || !(value.titleEn.trim() || value.titleAr.trim())) { this.messages.add({ severity: 'warn', summary: 'Choose a category and add a title', detail: 'A draft needs a valid blog category and at least one title.', life: 4000 }); return; }
    if (status === 'published' && !this.isPublishReady()) { this.messages.add({ severity: 'warn', summary: 'Complete both languages before publishing', detail: 'Publishing needs Arabic and English titles, author names, summaries, content, a category, and a featured image.', life: 5500 }); return; }
    try {
      const featuredImageId = this.featuredImage ? (await firstValueFrom(this.facade.uploadImage(this.featuredImage, 'cover'))).id : this.featuredImageId;
      const payload: BlogPostPayload = { ...value, featuredImageId, status: this.postId === null ? 'draft' : status };
      const post = this.postId === null ? await firstValueFrom(this.facade.create(payload)) : await firstValueFrom(this.facade.update(this.postId, payload));
      if (status === 'published' && (this.postId === null || this.currentStatus !== 'published')) await firstValueFrom(this.facade.publish(post.id));
      if (status === 'draft' && this.postId !== null && this.currentStatus === 'published') await firstValueFrom(this.facade.unpublish(post.id));
      this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'Blog updated' : 'Blog created', detail: status === 'published' ? 'Your blog post has been published.' : 'Your blog post was saved as a draft.', life: 3500 });
      await this.router.navigateByUrl('/dashboard/blogs');
    } catch { /* The HTTP interceptor displays API errors. */ }
  }
  protected cancel(): void { void this.router.navigateByUrl('/dashboard/blogs'); }
  private loadPost(id: number): void { this.facade.getById(id).subscribe({ next: (post) => { this.postId = post.id; this.currentStatus = post.status; this.featuredImageId = post.featuredImageId; this.imageName.set(post.featuredImageUrl ? 'Current featured image' : ''); this.featuredImagePreview.set(post.featuredImageUrl); this.form.patchValue({ titleEn: post.titleEn, titleAr: post.titleAr, authorNameEn: post.authorNameEn, authorNameAr: post.authorNameAr, shortDescriptionEn: post.shortDescriptionEn, shortDescriptionAr: post.shortDescriptionAr, contentEn: post.contentEn, contentAr: post.contentAr, categoryId: post.categoryId }); }, error: () => void this.router.navigateByUrl('/dashboard/blogs') }); }
  private toLeafOptions(categories: BlogCategory[]): Array<{ label: string; value: number }> { return categories.flatMap((category) => category.children.length ? category.children.map((child) => ({ label: `${category.nameEn} / ${child.nameEn}`, value: child.id })) : [{ label: category.nameEn, value: category.id }]); }
  private insertEditorImage(language: EditorLanguage, imageId: number, url: string): void { const editor = this.editors[language]; const range = editor.getSelection(true) ?? { index: editor.getLength(), length: 0 }; editor.insertEmbed(range.index, 'image', url, 'user'); const image = (Array.from(editor.root.querySelectorAll('img')) as HTMLImageElement[]).find((element) => element.getAttribute('src') === url); image?.setAttribute('data-image-id', String(imageId)); editor.setSelection(range.index + 1, 0, 'silent'); }
  private isPublishReady(): boolean { const value = this.form.getRawValue(); return Boolean(this.featuredImage || this.featuredImageId) && Boolean(value.categoryId) && [value.titleEn, value.titleAr, value.authorNameEn, value.authorNameAr, value.shortDescriptionEn, value.shortDescriptionAr].every((field) => field.trim().length > 0) && [value.contentEn, value.contentAr].every((content) => this.htmlText(content).length > 0); }
  private htmlText(html: string): string { const element = document.createElement('div'); element.innerHTML = html; return (element.textContent ?? '').trim(); }
  private isValidImage(file: File): boolean { return ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024; }
  private showInvalidImage(): void { this.messages.add({ severity: 'warn', summary: 'Invalid image', detail: 'Use a PNG, JPG, or WEBP image up to 10MB.', life: 4000 }); }
}
