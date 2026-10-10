import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { MessageService } from 'primeng/api';
import { Editor, EditorInitEvent, EditorTextChangeEvent } from 'primeng/editor';
import { Select } from 'primeng/select';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { BlogFacade } from '../../data-access/blog.facade';
import { BlogPostPayload, BlogStatus } from '../../data-access/blog.model';

@Component({ selector: 'app-blog-form', imports: [ReactiveFormsModule, Select, Editor], templateUrl: './blog-form.component.html', styleUrl: './blog-form.component.scss' })
export class BlogFormComponent implements OnInit {
  @ViewChild('contentImageInput') private contentImageInput?: ElementRef<HTMLInputElement>;
  private readonly formBuilder = inject(FormBuilder); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly sanitizer = inject(DomSanitizer); private readonly messages = inject(MessageService); private readonly header = inject(DashboardHeaderService); private readonly facade = inject(BlogFacade);
  private postId: number | string | null = null; private editor: any;
  protected readonly isEditMode = signal(false); protected readonly imageName = signal(''); protected readonly contentPreview = signal('');
  protected readonly previewHtml = computed(() => { const content = this.contentPreview(); return content ? this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(content, { ADD_ATTR: ['target'] })) : ''; });
  protected readonly categories = [{ label: 'Technology', value: 'Technology' }, { label: 'Marketing', value: 'Marketing' }, { label: 'Business', value: 'Business' }, { label: 'Culture', value: 'Culture' }];
  protected readonly form = this.formBuilder.nonNullable.group({ title: ['', [Validators.required, Validators.maxLength(180)]], category: ['', Validators.required], linkOne: [''], linkTwo: [''], content: ['', [Validators.required, Validators.minLength(20)]] });
  ngOnInit(): void { const idParam = this.route.snapshot.paramMap.get('id'); const id = idParam === null ? null : Number(idParam); const editing = id !== null && Number.isFinite(id); this.isEditMode.set(editing); if (id !== null && Number.isFinite(id)) this.loadPost(id); this.header.showBlogForm(editing); }
  protected selectImage(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 10 * 1024 * 1024) { this.messages.add({ severity: 'warn', summary: 'Invalid image', detail: 'Use a PNG or JPG image up to 10MB.', life: 3500 }); return; } this.imageName.set(file.name); }
  protected onEditorInit(event: EditorInitEvent): void { this.editor = event.editor; this.editor.getModule('toolbar').addHandler('image', () => this.contentImageInput?.nativeElement.click()); }
  protected updateContentPreview(event: EditorTextChangeEvent): void { this.contentPreview.set(event.htmlValue ?? ''); }
  protected selectContentImages(event: Event): void { const input = event.target as HTMLInputElement; const files = Array.from(input.files ?? []); input.value = ''; const valid = files.filter((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024); if (valid.length !== files.length) this.messages.add({ severity: 'warn', summary: 'Some images were skipped', detail: 'Use PNG, JPG, or WEBP files up to 5MB each.', life: 4000 }); if (valid.length && this.editor) void this.insertContentImages(valid); }
  protected save(status: BlogStatus): void { if (this.form.invalid) { this.form.markAllAsTouched(); this.messages.add({ severity: 'warn', summary: 'Complete the required fields', detail: 'Blog title, category, and content are required before saving.', life: 3500 }); return; } const payload: BlogPostPayload = { ...this.form.getRawValue(), imageName: this.imageName(), status }; const request = this.postId !== null ? this.facade.update(this.postId, payload) : this.facade.create(payload); request.subscribe({ next: () => { this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'Blog updated' : 'Blog created', detail: status === 'Published' ? 'Your blog post has been published.' : 'Your blog post was saved as a draft.', life: 3500 }); this.router.navigateByUrl('/dashboard/blogs'); } }); }
  protected cancel(): void { this.router.navigateByUrl('/dashboard/blogs'); }
  private loadPost(id: number): void { this.facade.getById(id).subscribe({ next: (post) => { this.postId = post.id; this.imageName.set(post.imageName ?? ''); this.form.patchValue({ title: post.title, category: post.category, linkOne: post.linkOne ?? '', linkTwo: post.linkTwo ?? '', content: post.content ?? '' }); this.contentPreview.set(post.content ?? ''); }, error: () => this.router.navigateByUrl('/dashboard/blogs') }); }
  private async insertContentImages(files: File[]): Promise<void> { for (const file of files) { const url = await this.fileToDataUrl(file); const range = this.editor.getSelection(true) ?? { index: this.editor.getLength(), length: 0 }; this.editor.insertEmbed(range.index, 'image', url, 'user'); this.editor.setSelection(range.index + 1, 0, 'silent'); } }
  private fileToDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); }); }
}
