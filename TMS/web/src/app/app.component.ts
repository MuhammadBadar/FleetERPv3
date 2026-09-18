import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskApi, TaskItem, emptyTask, priorities, statuses } from './core/task-api.service';

@Component({
  selector: 'app-root', standalone: true, imports: [FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly api = inject(TaskApi);
  readonly tasks = signal<TaskItem[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly storage = signal('Connecting');
  readonly editingId = signal<number | null>(null);
  readonly search = signal('');
  readonly statuses = statuses;
  readonly priorities = priorities;
  readonly visible = computed(() => this.tasks().filter(t =>
    (t.title + ' ' + t.userId + ' ' + t.id).toLowerCase().includes(this.search().toLowerCase())));
  readonly open = computed(() => this.tasks().filter(t => t.statusId !== 1107007 && t.statusId !== 1107005).length);
  readonly done = computed(() => this.tasks().filter(t => t.statusId === 1107007 || t.statusId === 1107005).length);
  model = emptyTask();

  constructor() {
    this.load();
    this.api.health().subscribe({ next: r => this.storage.set(r.storage), error: () => this.storage.set('Offline') });
  }
  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: data => { this.tasks.set(data); this.loading.set(false); },
      error: e => { this.error.set(this.message(e)); this.loading.set(false); }
    });
  }
  status(id: number) { return statuses.find(s => s.id === id)?.name ?? 'Unknown'; }
  priority(id: number) { return priorities.find(p => p.id === id)?.name ?? 'Unknown'; }
  edit(task: TaskItem) {
    this.editingId.set(task.id);
    this.model = { ...task, startDate: task.startDate ?? null, endDate: task.endDate ?? null };
    this.error.set(''); this.notice.set('');
  }
  reset() { this.editingId.set(null); this.model = emptyTask(); }
  save() {
    if (this.saving()) return;
    this.error.set(''); this.notice.set(''); this.saving.set(true);
    const input = { ...this.model, startDate: this.model.startDate || null, endDate: this.model.endDate || null };
    const id = this.editingId();
    const request = id === null ? this.api.create(input) : this.api.update(id, input);
    request.subscribe({
      next: () => { this.saving.set(false); this.reset(); this.notice.set('Task saved.'); this.load(); },
      error: e => { this.error.set(this.message(e)); this.saving.set(false); }
    });
  }
  remove(task: TaskItem) {
    if (!confirm('Delete task "' + task.title + '"?')) return;
    this.error.set(''); this.saving.set(true);
    this.api.delete(task.id).subscribe({
      next: () => {
        this.saving.set(false);
        if (this.editingId() === task.id) this.reset();
        this.notice.set('Task deleted.'); this.load();
      },
      error: e => { this.error.set(this.message(e)); this.saving.set(false); }
    });
  }
  private message(error: any): string {
    return error?.error?.detail ?? error?.error?.title ?? 'Cannot reach the API. Start the backend on localhost:5080.';
  }
}


