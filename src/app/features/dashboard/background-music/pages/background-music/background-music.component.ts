import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { BackgroundMusicFacade } from '../../data-access/background-music.facade';
import { BackgroundMusicUpdate } from '../../data-access/background-music.model';

const MAX_AUDIO_FILE_SIZE = 15 * 1024 * 1024;
const AUDIO_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'aac',
  'flac',
  'opus',
  'aiff',
  'aif',
  'wma',
  'webm',
]);

@Component({
  selector: 'app-background-music',
  imports: [ReactiveFormsModule],
  templateUrl: './background-music.component.html',
  styleUrl: './background-music.component.scss',
})
export class BackgroundMusicComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(BackgroundMusicFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);
  protected readonly sourceUrl = signal('');
  protected readonly fileName = signal('');
  protected readonly hasTrack = signal(false);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({ enabled: [false], loop: [false] });
  private previewObjectUrl: string | null = null;

  ngOnInit(): void {
    this.header.showBackgroundMusic();
    this.facade.load().subscribe((settings) => {
      this.sourceUrl.set(settings.sourceUrl);
      this.fileName.set(settings.fileName);
      this.hasTrack.set(settings.hasTrack);
      this.form.patchValue({ enabled: settings.enabled, loop: settings.loop });
    });
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  protected selectAudio(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!this.isAudioFile(file)) {
      input.value = '';
      this.messages.add({
        severity: 'warn',
        summary: 'Invalid audio file',
        detail: 'Choose a genuine audio file (MP3, WAV, OGG, M4A, AAC, FLAC, or another supported format).',
        life: 4000,
      });
      return;
    }
    if (file.size > MAX_AUDIO_FILE_SIZE) {
      input.value = '';
      this.messages.add({
        severity: 'warn',
        summary: 'File is too large',
        detail: 'Choose an audio file no larger than 15 MiB.',
        life: 4000,
      });
      return;
    }
    this.revokePreviewUrl();
    this.previewObjectUrl = URL.createObjectURL(file);
    this.sourceUrl.set(this.previewObjectUrl);
    this.fileName.set(file.name);
    this.selectedFile.set(file);
  }

  protected discardSelectedAudio(): void {
    this.revokePreviewUrl();
    this.selectedFile.set(null);
    const settings = this.facade.settings();
    this.sourceUrl.set(settings?.sourceUrl ?? '');
    this.fileName.set(settings?.fileName ?? '');
  }

  protected save(): void {
    if (this.form.controls.enabled.value && !this.hasTrack() && !this.selectedFile()) {
      this.messages.add({
        severity: 'warn',
        summary: 'Add music first',
        detail: 'Upload an audio file before enabling background music.',
        life: 3500,
      });
      return;
    }
    const values = this.form.getRawValue();
    const update: BackgroundMusicUpdate = { ...values, audioFile: this.selectedFile() };
    this.facade.save(update).subscribe((settings) => {
      this.revokePreviewUrl();
      this.selectedFile.set(null);
      this.sourceUrl.set(settings.sourceUrl);
      this.fileName.set(settings.fileName);
      this.hasTrack.set(settings.hasTrack);
      this.messages.add({
        severity: 'success',
        summary: 'Background music saved',
        detail: settings.enabled
          ? 'Background music is enabled for the website.'
          : 'Background music is currently disabled.',
        life: 3500,
      });
      this.form.markAsPristine();
    });
  }

  protected cancel(): void {
    const settings = this.facade.settings();
    if (!settings) return;
    this.revokePreviewUrl();
    this.selectedFile.set(null);
    this.sourceUrl.set(settings.sourceUrl);
    this.fileName.set(settings.fileName);
    this.hasTrack.set(settings.hasTrack);
    this.form.reset({ enabled: settings.enabled, loop: settings.loop });
  }

  private isAudioFile(file: File): boolean {
    if (file.type.startsWith('audio/') || file.type === 'application/ogg') return true;

    // Some browsers leave File.type empty for otherwise valid audio formats.
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension !== undefined && AUDIO_EXTENSIONS.has(extension);
  }

  private revokePreviewUrl(): void {
    if (this.previewObjectUrl) URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = null;
  }
}
