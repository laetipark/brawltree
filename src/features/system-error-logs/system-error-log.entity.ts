import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'system_error_logs' })
export class SystemErrorLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'occurred_at', type: 'timestamp', precision: 3 })
  occurredAt: Date;

  @Column({ type: 'varchar', length: 20 })
  source: string;

  @Column({ name: 'runtime_role', type: 'varchar', length: 30, nullable: true })
  runtimeRole: string | null;

  @Column({ type: 'varchar', length: 10 })
  level: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  event: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  status: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  path: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  target: string | null;

  @Column({ name: 'error_message', type: 'varchar', length: 1000, nullable: true })
  errorMessage: string | null;

  @Column({ name: 'error_code', type: 'varchar', length: 100, nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack: string | null;

  @Column({ name: 'context_key', type: 'varchar', length: 150, nullable: true })
  contextKey: string | null;

  @Column({ name: 'run_id', type: 'varchar', length: 80, nullable: true })
  runId: string | null;

  @Column({ name: 'request_id', type: 'varchar', length: 80, nullable: true })
  requestId: string | null;

  @Column({ name: 'instance_id', type: 'varchar', length: 40, nullable: true })
  instanceId: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  job: string | null;

  @Column({ name: 'duration_ms', type: 'int', unsigned: true, nullable: true })
  durationMs: number | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_note', type: 'varchar', length: 1000, nullable: true })
  resolvedNote: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;
}
