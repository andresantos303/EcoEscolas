// tests/checkpermissions.test.js
const checkPermissions = require('../backend/utils/checkPermissions');

describe('checkPermissions middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should return 401 if no user is provided', () => {
    const middleware = checkPermissions('any', 'any');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      errorCode: 'AUTH_UNAUTHORIZED',
      message: 'Token inválido ou não fornecido.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  describe('users resource permissions', () => {
    test('allows Admin', () => {
      req.user = { type: 'Admin', userId: '123' };
      const middleware = checkPermissions('users', 'any');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('allows Coordenador', () => {
      req.user = { type: 'Coordenador', userId: '123' };
      const middleware = checkPermissions('users', 'any');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('allows readById for same user', () => {
      req.user = { type: 'User', userId: 'abc' };
      req.params.id = 'abc';
      const middleware = checkPermissions('users', 'readById');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('denies readById for different user', () => {
      req.user = { type: 'User', userId: 'abc' };
      req.params.id = 'def';
      const middleware = checkPermissions('users', 'readById');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        errorCode: 'AUTH_FORBIDDEN',
        message: 'Não tem permissões para realizar esta ação.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('plans resource permissions', () => {
    test('allows Admin', () => {
      req.user = { type: 'Admin' };
      const middleware = checkPermissions('plans', 'any');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('allows Coordenador', () => {
      req.user = { type: 'Coordenador' };
      const middleware = checkPermissions('plans', 'any');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('denies others', () => {
      req.user = { type: 'User' };
      const middleware = checkPermissions('plans', 'any');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        errorCode: 'AUTH_FORBIDDEN',
        message: 'Não tem permissões para realizar esta ação.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('activities resource permissions', () => {
    ['Admin', 'Secretariado', 'Conselho Eco-Escolas'].forEach(type => {
      test(`allows ${type}`, () => {
        req.user = { type };
        const middleware = checkPermissions('activities', 'any');
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });

    test('denies others', () => {
      req.user = { type: 'User' };
      const middleware = checkPermissions('activities', 'any');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        errorCode: 'AUTH_FORBIDDEN',
        message: 'Não tem permissões para realizar esta ação.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  test('denies unknown resource even for Admin', () => {
    req.user = { type: 'Admin' };
    const middleware = checkPermissions('unknown', 'any');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      errorCode: 'AUTH_FORBIDDEN',
      message: 'Não tem permissões para realizar esta ação.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
