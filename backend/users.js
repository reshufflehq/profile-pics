import { getCurrentUser } from '@reshuffle/server-function';

/* @expose */
export async function getUserId() {
  const user = getCurrentUser();
  return user && user.id;
}
