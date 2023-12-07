# Trabalho final de Distemas de Distribuídos, UFLA

Docentes:
- Pedro Eduardo Garcia
- xx
- xx

Discente:
- XX

TO-DO: breve descrição do trabalho

## BUN - Business Units Network

O BUN (Business Units Network) é uma API que possibilita a criação de um modelo de negócio compartilhado, gerando uma API funcional e uma documentação de referência para os usuários finais. Isso promove a interoperabilidade entre diferentes sistemas.

### Objetivo

A API BUN foi desenvolvida com o intuito de facilitar a comunicação entre as diversas unidades de negócio da empresa, permitindo que os diferentes componentes do sistema atuem como um só. Isso unifica as equipes e suas demandas, proporcionando uma abordagem mais integrada.

### Benefícios

A API BUN oferece vários benefícios, incluindo:

- **Centralização da comunicação entre as unidades de negócio**
- **Reutilização da lógica de negócio existente**
- **Capacidade de mapear APIs de negócios específicos para diferentes sistemas**

Além disso, a API BUN também disponibiliza recursos para o gerenciamento de APIs, como documentação, testes e licenças.

### Como Utilizar

Para criar um modelo de negócio com a API BUN, siga os seguintes passos:

1. Crie um projeto
2. Defina recursos e aplicativos
3. Configure permissões e licenças

A API BUN também permite a geração de documentação de referência para os usuários finais, facilitando a compreensão e o uso da API.

### Resumo

Em resumo, a API BUN é uma ferramenta poderosa que facilita a criação de um modelo de negócio compartilhado. Isso promove a comunicação entre as unidades de negócio e impulsiona a interoperabilidade entre diferentes sistemas.

## Bun API para filmes

### Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento rode:
```bash
bun run dev
```

Em http://localhost:8000/ com o browser para ver o resultado.

### Como foi desenvolvido

#### Configurando um Projeto Bun

Primeiro, vamos criar um novo projeto Bun:

```bash
bun create elysia <name>
```

#### Rode a aplicação

Vá para o novo dir criado e rode:

```bash
bun run dev
```

Você deve ver algo desse tipo:

```bash
🦊 Elysia is running at localhost:8081
```

#### Adicionando SQLite

Agora vamos adicionar um banco de dados SQLite à nossa aplicação. Dentro da pasta src, crie um novo arquivo e nomeie-o como db.ts, veja o código a seguir:

```typescript
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
 
    // Add a book
    async addBook(book: Book) {
        // q: Get id type safely
        return this.db.query(`INSERT INTO books (name, author) VALUES (?, ?) RETURNING id`).get(book.name, book.author) as Book;
    }
 
    // Update a book
    async updateBook(id: number, book: Book) {
        return this.db.run(`UPDATE books SET name = '${book.name}', author = '${book.author}' WHERE id = ${id}`)
    }
 
    // Delete a book
    async deleteBook(id: number) {
        return this.db.run(`DELETE FROM books WHERE id = ${id}`)
    }
 
    async getBook(id: number) {
      return this.db.query(`SELECT * FROM books WHERE id=${id}`).get() as Book;
    }
 
    // Initialize the database
    async init() {
        return this.db.run('CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, author TEXT)');
    }
}
```

#### "Elysia decorate"

Podemos utilizar o banco de dados em nossos manipuladores (handlers) passando-o para o contexto do Elysia usando o 'decorate'.

Vamos modificar o arquivo index e adicionar o banco de dados (db) ao contexto do Elysia.

```typescript
import { Elysia, t } from "elysia";
import { BooksDatabase } from './db/db';
 
const app = new Elysia().decorate('db', new BooksDatabase)
 
app.get('/books', ({ db }) => db.getBooks());
app.post('/books', () => 'books')
app.put('/books', () => 'books')
app.get('/books/:id', () => 'books')
app.delete('/books/:id', () => 'books')
 
app.listen(8081)
 
 
console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
```

Agora, nosso primeiro ponto final (endpoint) utiliza o banco de dados SQLite do contexto.

#### "Elysia Schema"

Para definir tipos estritos para os manipuladores (handlers) do Elysia, introduzimos o uso de esquemas (schemas). O esquema garante segurança de tipo para parâmetros como o corpo da requisição.

Elysia também permite-nos acessar os parâmetros de caminho utilizando o objeto params do contexto do Elysia. Nós utilizamos os parâmetros de caminho nos pontos finais restantes para uma flexibilidade aprimorada.

Vamos modificar nosso código para usar o esquema para os nossos pontos finais (endpoints) de postagem (post) e atualização (put) e utilizar os parâmetros de caminho para os pontos finais restantes.


```typescript
import { Elysia, t } from "elysia";
import { BooksDatabase } from './db/db';
 
const app = new Elysia().decorate('db', new BooksDatabase)
 
app.get('/books', ({ db }) => db.getBooks());
app.post('/books', ({db, body }) => db.addBook(body), {
  body: t.Object({
    name: t.String(),
    author: t.String()
  })
})
app.put('/books', ({ db, body }) => db.updateBook(body.id, {name: body.name, author: body.author }), {
  body: t.Object({
    id: t.Number(),
    name: t.String(),
    author: t.String()
  })
})
 
app.get('/books/:id', ({db, params }) => db.getBook(parseInt(params.id)))
app.delete('/books/:id', ({db, params }) => db.deleteBook(parseInt(params.id)))
 
app.listen(8081)
 
 
console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
```

#### Plugins e conclusão

Por fim utilizamos de alguns plugins para lidar com cookies, JSON Web Token e swagger para podermos acessar nossa API no browser.


```typescript
import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { BooksDatabase } from './db';
class Unauthorized extends Error {
  constructor(){
    super('Unauthorized');
  }
}

const app = new Elysia().use(swagger()).addError({
  '401': Unauthorized
}).onError(({ code, error}) => {

  let status;

  switch (true) {
    case code === 'VALIDATION':
      status = 400;
      break;
    case code === 'NOT_FOUND':
      status = 404;
      break;
    case code === '401':
      status = 401;
      break;
    default:
      status = 500;
  }

  return new Response(error.toString(), {status: status})
}).use(cookie()).use(jwt({
  name: 'jwt',
  secret: 'supersecret'
})).decorate('db', new BooksDatabase());

app.get('/books', ({db}) => db.getBooks());

app.post('/books', ({db, body}) => db.addBook(body), {
  body: t.Object({
    name: t.String(),
    author: t.String()
  })
})

app.put('/books', ({db, body }) => db.updateBook(body.id, { name: body.name, author: body.author}), {
  body: t.Object({
    id: t.Number(),
    name: t.String(),
    author: t.String()
  })
});

app.get('/books/:id', async ({db, params, jwt, cookie: {auth} }) => {

  const profile =  await jwt.verify(auth);

  if (!profile) throw new Unauthorized();


  return db.getBook(parseInt(params.id))
});

app.delete('/books/:id', ({db, params }) => db.deleteBook(parseInt(params.id)));

app.listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

```

Dessa forma podemos acessar a API em: http://localhost:8081/swagger
