import * as migration_20260316_192047 from './20260316_192047';
import * as migration_20260316_210055 from './20260316_210055';
import * as migration_20260316_213516 from './20260316_213516';
import * as migration_20260316_213939 from './20260316_213939';

export const migrations = [
  {
    up: migration_20260316_192047.up,
    down: migration_20260316_192047.down,
    name: '20260316_192047',
  },
  {
    up: migration_20260316_210055.up,
    down: migration_20260316_210055.down,
    name: '20260316_210055',
  },
  {
    up: migration_20260316_213516.up,
    down: migration_20260316_213516.down,
    name: '20260316_213516',
  },
  {
    up: migration_20260316_213939.up,
    down: migration_20260316_213939.down,
    name: '20260316_213939'
  },
];
