import { getCurrentUser } from '@reshuffle/server-function';
import { update } from '@reshuffle/db';

/* @expose */
export async function incrViewCount() {
  const user = getCurrentUser();
  if (user === undefined) {
    return 0;
  }

  return update(`/views/${user.id}`, (cnt) => (cnt || 0) + 1);
}
