import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TaskInput {
  id: number;
  title: string; description: string; userId: string; projectId: number; moduleId: number;
  statusId: number; priorityId: number; sp: number; startDate: string | null;
  endDate: string | null; reason: string; isActive: boolean;
}
export interface TaskItem extends TaskInput { id: number; clientId: number; createdOn: string; modifiedOn: string; }
export const statuses = [
  { id: 1107001, name: 'Open' }, { id: 1107002, name: 'In progress' },
  { id: 1107003, name: 'In testing' }, { id: 1107004, name: 'Reopened' },
  { id: 1107005, name: 'Resolved' }, { id: 1107006, name: 'Stalled' },
  { id: 1107007, name: 'Closed' }
];
export const priorities = [0, 1, 2, 3, 4].map(x => ({ id: 1108001 + x, name: 'P' + x }));
export const emptyTask = (): TaskInput => ({
  id: 0, title: '', description: '', userId: '', projectId: 0, moduleId: 0,
  statusId: 1107001, priorityId: 1108003, sp: 0, startDate: null,
  endDate: null, reason: '', isActive: true
});
@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  // Client 1 is the local demo workspace. Production must derive this from authenticated identity.
  private readonly url = '/api/tasks';
  list() { return this.http.get<TaskItem[]>(this.url); }
  create(input: TaskInput) { return this.http.post<TaskItem>(this.url, input); }
  update(id: number, input: TaskInput) { return this.http.put<TaskItem>(this.url + '/' + id, input); }
  delete(id: number) { return this.http.delete<void>(this.url + '/' + id); }
  health() { return this.http.get<{ storage: string }>('/health'); }
}


