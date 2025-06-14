jest.mock('../backend/models/user.model.js', () => {
  const m = jest.fn();
  m.find = jest.fn();
  m.findOne = jest.fn();
  m.findById = jest.fn();
  m.findByIdAndDelete = jest.fn();
  return m;
});
jest.mock('../backend/models/plan.model.js', () => {
  const m = jest.fn();
  m.findOne = jest.fn();
  return m;
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../backend/models/user.model');
const Plan = require('../backend/models/plan.model');
const {getAllUsers,createUser,loginUser,getUserById,updateUser,deleteUser} = require('../backend/controllers/users.controller');

describe('Users Controller (unit, jest mocks)', () => {
  let req, res;

  beforeEach(() => {
    // Reset request and response mocks
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Restore original implementations of any spied functions
    jest.restoreAllMocks();
    // Clear mock call history
    jest.clearAllMocks();
  });

  //
  // getAllUsers
  //
  describe('getAllUsers', () => {
    it('returns 200 and users list without filters', async () => {
      const fake = [{ name: 'A' }, { name: 'B' }];
      User.find.mockResolvedValue(fake);

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('applies name and type filters', async () => {
      const fake = [{ name: 'X', type: 'T' }];
      req.query = { name: 'X', type: 'T' };
      User.find.mockResolvedValue(fake);

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({ name: 'X', type: 'T' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('handles errors with 500', async () => {
      User.find.mockRejectedValue(new Error('oops'));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao buscar utilizadores.' });
    });
  });

  //
  // createUser
  //
  describe('createUser', () => {
    const valid = {
      name: 'João',
      email: 'joao@t.com',
      password: 'Abc123!@',
      type: 'Admin',
    };

    it('400 if missing fields', async () => {
      req.body = { email: 'a@t.com', password: 'Abc123!@', type: 'A' };
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_REGISTRATION_BAD_REQUEST' })
      );
    });

    it('400 if invalid email', async () => {
      req.body = { ...valid, email: 'invalid' };
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_REGISTRATION_INVALID_EMAIL' })
      );
    });

    it('400 if weak password', async () => {
      req.body = { ...valid, password: 'weakpass' };
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_REGISTRATION_WEAK_PASSWORD' })
      );
    });

    it('409 if email exists', async () => {
      req.body = valid;
      User.findOne.mockResolvedValue({ email: valid.email });
      await createUser(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: valid.email });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_EMAIL_ALREADY_EXISTS' })
      );
    });

    it('201 on success', async () => {
      req.body = valid;
      User.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpwd');
      const saveMock = jest.fn().mockResolvedValue();
      User.mockImplementation(() => ({
        _id: 'ID1',
        name: valid.name,
        email: valid.email,
        type: valid.type,
        save: saveMock,
      }));

      await createUser(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 'ID1',
        name: valid.name,
        email: valid.email,
        type: valid.type,
      });
    });

    it('500 on internal error', async () => {
      req.body = valid;
      User.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('fail'));
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro interno ao registar utilizador.',
      });
    });
  });

  //
  // loginUser
  //
  describe('loginUser', () => {
    const creds = { email: 'u@t.com', password: 'Abc123!@' };

    it('400 if missing fields', async () => {
      req.body = { email: creds.email };
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'LOGIN_BAD_REQUEST' })
      );
    });

    it('404 if user not found', async () => {
      req.body = creds;
      User.findOne.mockResolvedValue(null);
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'LOGIN_USER_NOT_REGISTERED' })
      );
    });

    it('401 if wrong password', async () => {
      req.body = creds;
      User.findOne.mockResolvedValue({ password: 'hashed' });
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'LOGIN_INVALID_CREDENTIALS' })
      );
    });

    it('200 and token on success', async () => {
      req.body = creds;
      const fakeUser = { _id: 'ID2', type: 'Aluno', password: 'hashed' };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('T0K3N');

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'ID2', token: 'T0K3N' });
    });

    it('500 on internal error', async () => {
      req.body = creds;
      User.findOne.mockRejectedValue(new Error('boom'));
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno no login.' });
    });
  });


  //
  // getUserById
  //
  describe('getUserById', () => {
    it('200 with user data', async () => {
      const fake = { _id: 'ID3', name: 'X' };
      User.findById.mockReturnValue({ populate: () => Promise.resolve(fake) });
      req.params.id = 'ID3';

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith('ID3');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('404 if not found', async () => {
      User.findById.mockReturnValue({ populate: () => Promise.resolve(null) });
      req.params.id = 'ID3';

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'AUTH_UNAUTHORIZED' })
      );
    });

    it('500 on internal error', async () => {
      User.findById.mockReturnValue({ populate: () => Promise.reject(new Error()) });
      req.params.id = 'ID3';

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao obter utilizador.' });
    });
  });

  //
  // updateUser
  //
  describe('updateUser', () => {
    const existing = {
      _id: 'ID4',
      name: 'Old',
      email: 'old@t.com',
      type: 'Secretariado',
      save: jest.fn().mockResolvedValue(),
    };

    it('400 if no fields', async () => {
      req.params.id = 'ID4';
      req.body = {};
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_DATA_INVALID' })
      );
    });

    it('400 if invalid email', async () => {
      req.params.id = 'ID4';
      req.body = { email: 'inv' };
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_DATA_INVALID' })
      );
    });

    it('404 if not found', async () => {
      User.findById.mockResolvedValue(null);
      req.params.id = 'ID4';
      req.body = { name: 'X' };
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_NOT_FOUND' })
      );
    });

    it('409 if email exists', async () => {
      User.findById.mockResolvedValue(existing);
      User.findOne.mockResolvedValue({});
      req.params.id = 'ID4';
      req.body = { email: 'other@t.com' };
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_ALREADY_EXISTS' })
      );
    });

    it('200 on success', async () => {
      User.findById.mockResolvedValue(existing);
      User.findOne.mockResolvedValue(null);
      req.params.id = 'ID4';
      req.body = { name: 'New', email: 'new@t.com', type: 'Admin' };
      await updateUser(req, res);

      expect(existing.name).toBe('New');
      expect(existing.email).toBe('new@t.com');
      expect(existing.type).toBe('Admin');
      expect(existing.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 'ID4',
        name: 'New',
        email: 'new@t.com',
        type: 'Admin',
      });
    });

    it('500 on internal error', async () => {
      User.findById.mockRejectedValue(new Error());
      req.params.id = 'ID4';
      req.body = { name: 'X' };
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro interno ao atualizar utilizador.',
      });
    });
  });

  //
  // deleteUser
  //
  describe('deleteUser', () => {
    it('404 if not found', async () => {
      User.findById.mockResolvedValue(null);
      req.params.id = 'ID5';
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_NOT_FOUND' })
      );
    });

    it('403 if active plan', async () => {
      User.findById.mockResolvedValue({ _id: 'ID5' });
      Plan.findOne.mockResolvedValue({ owner: 'ID5', isActive: true });
      req.params.id = 'ID5';
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: 'USER_DELETE_BLOCKED' })
      );
    });

    it('200 on success', async () => {
      User.findById.mockResolvedValue({ _id: 'ID5' });
      Plan.findOne.mockResolvedValue(null);
      User.findByIdAndDelete.mockResolvedValue({});
      req.params.id = 'ID5';
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utilizador removido com sucesso.' });
    });

    it('500 on internal error', async () => {
      User.findById.mockRejectedValue(new Error());
      req.params.id = 'ID5';
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro interno ao remover utilizador.',
      });
    });
  });
});
