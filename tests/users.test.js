require('dotenv').config(); // carrega MONGODB_URI_TEST, JWT_SECRET, JWT_EXPIRES_IN
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = require('../backend/server');
const User = require('../backend/models/user.model');
const Plan = require('../backend/models/plan.model');

const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Users API', () => {
  //
  // GET /users
  //
  describe('GET /users', () => {
    beforeEach(async () => {
      await User.create([
        { name: 'Alice', email: 'a@t.com', password: 'hash', type: 'Admin' },
        { name: 'Bob',   email: 'b@t.com', password: 'hash', type: 'Secretariado' },
      ]);
    });

    it('deve listar todos os utilizadores', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('deve filtrar por nome', async () => {
      const res = await request(app)
        .get('/users')
        .query({ name: 'Alice' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Alice');
    });

    it('deve filtrar por type', async () => {
      const res = await request(app)
        .get('/users')
        .query({ type: 'Professor' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].type).toBe('Professor');
    });
  });

  //
  // POST /users/register
  //
  describe('POST /users/register', () => {
    it('deve criar um utilizador válido', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          name: 'João Silva',
          email: 'joao@teste.com',
          password: 'Teste123!',
          type: 'Admin'
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'João Silva',
        email: 'joao@teste.com',
        type: 'Admin'
      });
      expect(res.body).toHaveProperty('id');
    });

    it('deve rejeitar se faltar campo', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({ email: 'x@t.com', password: 'Teste123!', type: 'Admin' }); // falta name

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_REGISTRATION_BAD_REQUEST');
    });

    it('deve rejeitar email inválido', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          name: 'X',
          email: 'invalid-email',
          password: 'Teste123!',
          type: 'Admin'
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_REGISTRATION_INVALID_EMAIL');
    });

    it('deve rejeitar password fraca', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          name: 'X',
          email: 'x@t.com',
          password: 'weakpwd',
          type: 'Admin'
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_REGISTRATION_WEAK_PASSWORD');
    });

    it('deve rejeitar email já existente', async () => {
      await User.create({
        name: 'Y',
        email: 'y@t.com',
        password: await bcrypt.hash('Teste123!', 10),
        type: 'Aluno'
      });

      const res = await request(app)
        .post('/users/register')
        .send({
          name: 'Z',
          email: 'y@t.com',
          password: 'Teste123!',
          type: 'Admin'
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_EMAIL_ALREADY_EXISTS');
    });
  });

  //
  // POST /users/login
  //
  describe('POST /users/login', () => {
    beforeEach(async () => {
      const hash = await bcrypt.hash('Teste123!', 10);
      await User.create({
        name: 'Maria',
        email: 'maria@t.com',
        password: hash,
        type: 'Admin'
      });
    });

    it('deve autenticar credenciais válidas', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'maria@t.com', password: 'Teste123!' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('id');
    });

    it('deve rejeitar se faltar campo', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'maria@t.com' }); // falta password

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('LOGIN_BAD_REQUEST');
    });

    it('deve rejeitar user não registado', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'noone@t.com', password: 'Teste123!' });

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('LOGIN_USER_NOT_REGISTERED');
    });

    it('deve rejeitar credenciais incorretas', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'maria@t.com', password: 'Wrong123!' });

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('LOGIN_INVALID_CREDENTIALS');
    });
  });

  //
  // GET /users/:id
  //
  describe('GET /users/:id', () => {
    let user;
    beforeEach(async () => {
      user = await User.create({
        name: 'Teste',
        email: 't@t.com',
        password: await bcrypt.hash('Teste123!', 10),
        type: 'Admin'
      });
    });

    it('deve retornar utilizador válido', async () => {
      const res = await request(app).get(`/users/${user._id}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('t@t.com');
    });

    it('deve rejeitar ID não existente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/users/${fakeId}`);
      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('AUTH_UNAUTHORIZED');
    });
  });

  //
  // PUT /users/:id
  //
  describe('PUT /users/:id', () => {
    let user;
    beforeEach(async () => {
      user = await User.create({
        name: 'Old',
        email: 'old@t.com',
        password: await bcrypt.hash('Teste123!', 10),
        type: 'Aluno'
      });
    });

    it('deve atualizar nome e type', async () => {
      const res = await request(app)
        .put(`/users/${user._id}`)
        .send({ name: 'New', type: 'Admin' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: String(user._id),
        name: 'New',
        email: 'old@t.com',
        type: 'Admin'
      });
    });

    it('deve rejeitar se nenhum campo enviado', async () => {
      const res = await request(app)
        .put(`/users/${user._id}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_DATA_INVALID');
    });

    it('deve rejeitar email inválido', async () => {
      const res = await request(app)
        .put(`/users/${user._id}`)
        .send({ email: 'inválido' });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_DATA_INVALID');
    });

    it('deve rejeitar email já existente', async () => {
      await User.create({
        name: 'X',
        email: 'x@t.com',
        password: await bcrypt.hash('Teste123!', 10),
        type: 'Aluno'
      });

      const res = await request(app)
        .put(`/users/${user._id}`)
        .send({ email: 'x@t.com' });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_ALREADY_EXISTS');
    });

    it('deve rejeitar PUT para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/users/${fakeId}`)
        .send({ name: 'Nada' });

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('USER_NOT_FOUND');
    });
  });

  //
  // DELETE /users/:id
  //
  describe('DELETE /users/:id', () => {
    let user;
    beforeEach(async () => {
      user = await User.create({
        name: 'Del',
        email: 'del@t.com',
        password: await bcrypt.hash('Teste123!', 10),
        type: 'Aluno'
      });
    });

    it('deve apagar utilizador sem planos ativos', async () => {
      const res = await request(app).delete(`/users/${user._id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Utilizador removido com sucesso.');
    });

    it('deve bloquear se existir plano ativo', async () => {
      await Plan.create({ owner: user._id, name: 'P', isActive: true });
      const res = await request(app).delete(`/users/${user._id}`);
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('USER_DELETE_BLOCKED');
    });

    it('deve rejeitar DELETE para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/users/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('USER_NOT_FOUND');
    });
  });
});
