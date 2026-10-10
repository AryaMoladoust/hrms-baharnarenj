// Is this error "the database cannot be reached" (not running, wrong address, wrong password...) rather than a bug in the app?
export function isDbError(error) {
  const name = String(error?.name || '');
  const message = String(error?.message || '');
  return name.startsWith('Mongo') || name === 'MongooseServerSelectionError' || /MONGODB_URI|ECONNREFUSED|ENOTFOUND|querySrv|buffering timed out/i.test(message);
}
