import { Database } from 'bun:sqlite';

export interface Book {
  id?: number;
  name: string;
  author: string;
}

export class BooksDatabase {
  private db: Database;

  constructor() {
    this.db = new Database('books.db');
    // Initialize the database
    this.init()
      .then(() => console.log('Database initialized'))
      .catch(console.error);
  }

  // Get all books
  async getBooks() {
    return this.db.query('SELECT * FROM books').all();
  }

  async init() {
    return this.db.run('CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, author TEXT)');
  }
}