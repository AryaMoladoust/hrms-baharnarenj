import * as repo from '@/lib/db/repo';
import { hashPassword } from '@/lib/owner/password';

// The two owner accounts. They are created once, the first time somebody logs in and no owner exists yet.
// The starting password is "1234" (unless OWNER_SEED_PASSWORD is set) and the panel keeps asking the owner to change it (mustChangePassword).
export const SEED_OWNERS = [
  { username: 'milad', displayName: 'milad' },
  { username: 'mmd', displayName: 'mmd' },
];
// On a real server set OWNER_SEED_PASSWORD (in the environment variables) so the accounts never exist with the easy default.
const STARTING_PASSWORD = process.env.OWNER_SEED_PASSWORD || '1234';

export async function ensureSeedOwners() {
  if ((await repo.countOwners()) > 0) return;
  for (const owner of SEED_OWNERS) {
    await repo.createOwner({ ...owner, passwordHash: await hashPassword(STARTING_PASSWORD), mustChangePassword: true });
  }
}
