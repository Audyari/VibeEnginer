export const env = {
  db: {
    url: process.env.DB_URL || 'file:sqlite.db',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || 'localhost',
  },
};
