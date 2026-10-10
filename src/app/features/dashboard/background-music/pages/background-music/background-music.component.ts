import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { BackgroundMusicFacade } from '../../data-access/background-music.facade';
import { BackgroundMusicSettings } from '../../data-access/background-music.model';

const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];

@Component({ selector: 'app-background-music', imports: [ReactiveFormsModule], templateUrl: './background-music.component.html', styleUrl: './background-music.component.scss' })
export class BackgroundMusicComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(BackgroundMusicFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);
  protected readonly sourceUrl = signal('');
  protected readonly fileName = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({ enabled: [false], loop: [true], volume: [30] });

  ngOnInit(): void {
    this.header.showBackgroundMusic();
    this.facade.load().subscribe((settings) => {
      this.sourceUrl.set(settings.sourceUrl);
      this.fileName.set(settings.fileName);
      this.form.patchValue({ enabled: settings.enabled, loop: settings.loop, volume: settings.volume });
    });
  }

  protected selectAudio(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type) || file.size > 15 * 1024 * 1024) {
      this.messages.add({ severity: 'warn', summary: 'Invalid audio file', detail: 'Use an MP3, WAV, OGG, or M4A file up to 15MB.', life: 4000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.sourceUrl.set(String(reader.result));
    reader.readAsDataURL(file);
    this.fileName.set(file.name);
  }

  protected removeAudio(): void {
    this.sourceUrl.set('');
    this.fileName.set('');
    this.form.controls.enabled.setValue(false);
  }

  protected save(): void {
    if (this.form.controls.enabled.value && !this.sourceUrl()) {
      this.messages.add({ severity: 'warn', summary: 'Add music first', detail: 'Upload an audio file before enabling background music.', life: 3500 });
      return;
    }
    const values = this.form.getRawValue();
    const settings: BackgroundMusicSettings = { sourceUrl: this.sourceUrl(), fileName: this.fileName(), ...values };
    this.facade.save(settings).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'Background music saved', detail: settings.enabled ? 'Background music is enabled for the website.' : 'Background music is currently disabled.', life: 3500 });
      this.form.markAsPristine();
    });
  }

  protected cancel(): void {
    const settings = this.facade.settings();
    if (!settings) return;
    this.sourceUrl.set(settings.sourceUrl);
    this.fileName.set(settings.fileName);
    this.form.reset({ enabled: settings.enabled, loop: settings.loop, volume: settings.volume });
  }
}
