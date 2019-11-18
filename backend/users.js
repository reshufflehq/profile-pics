import { useSession } from '@reshuffle/server-function';

/* @expose */
export async function getSession() {
  const session = useSession();
  return session;
}
