import { workerData } from 'node:worker_threads';
import { register } from 'tsx/esm/api';

register();

if (workerData.script_path) {
  await import(workerData.script_path);
}
