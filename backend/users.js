import { getCurrentUser } from '@reshuffle/server-function';
import * as db from '@reshuffle/db';
import storage from '@reshuffle/storage';

/* @expose */
export async function getProfile() {
  const user = getCurrentUser();
  if (user === undefined) {
    return undefined;
  }

  return db.get(`/profile/${user.id}`);
}

/* @expose */
export async function setProfilePic(token) {
  const user = getCurrentUser(true);
  const id = await storage.finalizeUpload(token);
  return db.update(`/profile/${user.id}`, () => ({
    picture: {
      objectId: id, // Keep so we can delete it
      url: storage.publicUrl(id),
    },
  }));
}
