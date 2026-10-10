import { Observable } from 'rxjs';

export type EntityId = number | string;

export interface CrudRepository<TEntity, TCreate, TUpdate = TCreate> {
  list(): Observable<TEntity[]>;
  getById(id: EntityId): Observable<TEntity>;
  create(payload: TCreate): Observable<TEntity>;
  update(id: EntityId, payload: TUpdate): Observable<TEntity>;
  remove(id: EntityId): Observable<void>;
}
