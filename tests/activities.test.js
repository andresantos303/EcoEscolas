// activities.test.js

jest.mock('../backend/models/activity.model.js', () => {
  const m = jest.fn();
  m.find = jest.fn();
  m.findById = jest.fn();
  m.findOne = jest.fn();
  m.countDocuments = jest.fn();
  m.findByIdAndDelete = jest.fn();
  m.findByIdAndUpdate = jest.fn();
  return m;
});

jest.mock('../backend/models/plan.model.js', () => {
  const m = jest.fn();
  m.findById = jest.fn();
  m.findByIdAndUpdate = jest.fn();
  return m;
});

jest.mock('../backend/models/user.model.js', () => {
  const m = jest.fn();
  m.findById = jest.fn();
  return m;
});

jest.mock('../backend/utils/nodemailer.js', () => ({
  enviarEmail: jest.fn().mockResolvedValue(),
  enviarEmailNotificação: jest.fn().mockResolvedValue(),
}));

jest.mock('../backend/utils/upload.js', () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

jest.mock('../backend/utils/errorHandler.js', () => ({
  handleError: jest.fn((res, errorCode) => {
    const statusMap = {
      ACTIVITY_NOT_FOUND: 404,
      ACTIVITY_REGISTRATION_BAD_REQUEST: 400,
      ACTIVITY_REGISTRATION_INVALID_DATE: 400,
      PLAN_ACTIVITY_NOT_FOUND: 404,
      ACTIVITY_REGISTRATION_DUPLICATE: 409,
      ACTIVITY_PARTICIPANT_BAD_REQUEST: 400,
      ACTIVITY_PARTICIPANT_DUPLICATE: 409,
      ACTIVITY_CANNOT_DELETE: 400,
    };
    return res.status(statusMap[errorCode] || 500).json({ errorCode });
  }),
}));

const Activity = require('../backend/models/activity.model.js');
const Plan = require('../backend/models/plan.model.js');
const User = require('../backend/models/user.model.js');
const { enviarEmail, enviarEmailNotificação } = require('../backend/utils/nodemailer.js');
const { cloudinary } = require('../backend/utils/upload.js');

const {
  getAllActivities,
  getActivityById,
  getActivitiesByPlan,
  createActivity,
  addParticipant,
  updateActivity,
  deleteActivity,
  finalizeActivity,
  startActivity,
  getActivitiesCount,
  getActivitiesPublic,
} = require('../backend/controllers/activities.controller.js');

describe('Activities Controller', () => {
  let req, res;
  beforeEach(() => {
    req = { params: {}, query: {}, body: {}, files: [], user: { userId: 'U1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getAllActivities', () => {
    it('200 without filters', async () => {
      const fake = [{ nome: 'A1' }];
      Activity.find.mockResolvedValue(fake);
      await getAllActivities(req, res);
      expect(Activity.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('applies filters', async () => {
      const fake = [];
      req.query = { nome: 'X' };
      req.params.estado = 'true';
      Activity.find.mockResolvedValue(fake);
      await getAllActivities(req, res);
      expect(Activity.find).toHaveBeenCalledWith({ nome: 'X', estado: 'true' });
    });

    it('500 on error', async () => {
      Activity.find.mockRejectedValue(new Error());
      await getAllActivities(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao buscar atividades.' });
    });
  });

  describe('getActivityById', () => {
    it('200 when found', async () => {
      const fake = { _id: 'A1' };
      Activity.findById.mockReturnValue({
        populate: () => ({ populate: () => Promise.resolve(fake) })
      });
      req.params.id = 'A1';
      await getActivityById(req, res);
      expect(Activity.findById).toHaveBeenCalledWith('A1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('404 if not found', async () => {
      Activity.findById.mockReturnValue({ populate: () => ({ populate: () => Promise.resolve(null) }) });
      await getActivityById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ACTIVITY_NOT_FOUND' }));
    });

    it('500 on error', async () => {
      Activity.findById.mockImplementation(() => { throw new Error(); });
      await getActivityById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao obter atividade.' });
    });
  });

  describe('createActivity', () => {
    const base = { nome: 'N', descricao: 'D', local: 'L', data: new Date(Date.now()+86400000).toISOString(), estado: 'true' };
    it('400 if missing fields', async () => {
      req.body = {};
      await createActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 if invalid date', async () => {
      req.body = { ...base, data: '2020-01-01' };
      req.params.idPlano = 'P1';
      await createActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ACTIVITY_REGISTRATION_INVALID_DATE' }));
    });

    it('404 if plan not found', async () => {
      req.body = base;
      req.params.idPlano = 'P2';
      Plan.findById.mockResolvedValue(null);
      await createActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'PLAN_ACTIVITY_NOT_FOUND' }));
    });

    it('409 on duplicate activity', async () => {
      req.body = base;
      req.params.idPlano = 'P3';
      Plan.findById.mockResolvedValue({ nome: 'P' });
      Activity.findOne.mockResolvedValue({ nome: 'N' });
      await createActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ACTIVITY_REGISTRATION_DUPLICATE' }));
    });

    it('201 on success', async () => {
      req.body = base;
      req.params.idPlano = 'P4';
      Plan.findById.mockResolvedValue({ nome: 'Plan4' });
      Activity.findOne.mockResolvedValue(null);
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'url', public_id: 'id' });
      const saveMock = jest.fn().mockResolvedValue();
      Activity.mockImplementation(() => ({ _id: 'A1', save: saveMock, nome: base.nome }));
      Plan.findByIdAndUpdate.mockResolvedValue();
      User.findById.mockResolvedValue({ name: 'User1', associatedActivities: [], save: jest.fn() });
      
      await createActivity(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(Plan.findByIdAndUpdate).toHaveBeenCalledWith('P4', { $push: { associatedActivities: 'A1' } });
      expect(enviarEmailNotificação).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Atividade registrada com sucesso!', atividadeId: 'A1' });
    });

    it('500 on internal error', async () => {
      req.body = base;
      req.params.idPlano = 'P5';
      Plan.findById.mockResolvedValue({});
      Activity.findOne.mockRejectedValue(new Error());
      await createActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao registrar atividade.' });
    });
  });

  describe('addParticipant', () => {
    const part = { nome: 'P', email: 'p@e.com' };
    it('400 if missing fields', async () => {
      req.body = {};
      await addParticipant(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('404 if activity not found', async () => {
      req.body = part;
      req.params.idAtividade = 'A2';
      Activity.findById.mockResolvedValue(null);
      await addParticipant(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ACTIVITY_NOT_FOUND' }));
    });

    it('409 on duplicate participant', async () => {
      req.body = part;
      req.params.idAtividade = 'A3';
      Activity.findById.mockResolvedValue({ nome: 'Act', participants: [part], save: jest.fn() });
      await addParticipant(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ACTIVITY_PARTICIPANT_DUPLICATE' }));
    });

    it('200 on success', async () => {
      req.body = part;
      req.params.idAtividade = 'A4';
      const saveMock = jest.fn().mockResolvedValue();
      Activity.findById.mockResolvedValue({ nome: 'Act', participants: [], save: saveMock });
      await addParticipant(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(enviarEmail).toHaveBeenCalledWith(
        part.email,
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Participante adicionado com sucesso!', atividadeId: undefined });
    });

    it('500 on error', async () => {
      req.body = part;
      req.params.idAtividade = 'A5';
      Activity.findById.mockRejectedValue(new Error());
      await addParticipant(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao adicionar participante.' });
    });
  });

  describe('updateActivity', () => {
    it('404 if not found', async () => {
      Activity.findById.mockResolvedValue(null);
      await updateActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 if invalid date', async () => {
      req.params.id = 'A6';
      Activity.findById.mockResolvedValue({ save: jest.fn(), fotos: [], estado: false });
      req.body = { data: '2020-01-01' };
      await updateActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('200 on success', async () => {
      const saveMock = jest.fn().mockResolvedValue();
      Activity.findById.mockResolvedValue({ save: saveMock });
      req.params.id = 'A7';
      req.body = { nome: 'New' };
      await updateActivity(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Atividade atualizada com sucesso!' });
    });

    it('500 on error', async () => {
      Activity.findById.mockRejectedValue(new Error());
      req.body = { nome: 'X' };
      await updateActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao atualizar atividade.' });
    });
  });

  describe('deleteActivity', () => {
    it('404 if not found', async () => {
      Activity.findById.mockResolvedValue(null);
      await deleteActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 if active', async () => {
      req.params.id = 'A8';
      Activity.findById.mockResolvedValue({ estado: true, fotos: [], planActivitiesId: null });
      await deleteActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ACTIVITY_CANNOT_DELETE' }));
    });

    it('200 on success', async () => {
      req.params.id = 'A9';
      Activity.findById.mockResolvedValue({ estado: false, fotos: [{ cloudinary_id: 'C1' }], planActivitiesId: 'P1', _id: 'A9' });
      Plan.findByIdAndUpdate.mockResolvedValue();
      Activity.findByIdAndDelete.mockResolvedValue();
      await deleteActivity(req, res);
      expect(Plan.findByIdAndUpdate).toHaveBeenCalledWith('P1', { $pull: { associatedActivities: 'A9' } });
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('C1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Atividade removida com sucesso.' });
    });

    it('500 on error', async () => {
      req.params.id = 'A10';
      Activity.findById.mockRejectedValue(new Error());
      await deleteActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao remover atividade.' });
    });
  });

  describe('finalizeActivity', () => {
    it('404 if not found', async () => {
      req.params.id = 'A11';
      Activity.findById.mockResolvedValue(null);
      await finalizeActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 if no participantsCount', async () => {
      req.params.id = 'A12';
      Activity.findById.mockResolvedValue({ fotos: [], estado: true });
      await finalizeActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errorCode: 'PARTICIPANTS_COUNT_REQUIRED', message: 'O número de participantes é obrigatório para finalizar a atividade.' });
    });

    it('200 on success', async () => {
      req.params.id = 'A13';
      Activity.findById.mockResolvedValue({ fotos: [], participantsCount: 0 });
      req.files = [{ path: 'img1' }];
      Activity.findByIdAndUpdate.mockResolvedValue();
      req.body = { participantsCount: 5 };
      await finalizeActivity(req, res);
      expect(Activity.findByIdAndUpdate).toHaveBeenCalledWith('A13', expect.objectContaining({ estado: false, participantsCount: 5 }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Atividade finalizada com sucesso.' });
    });

    it('500 on error', async () => {
      req.params.id = 'A14';
      Activity.findById.mockRejectedValue(new Error());
      await finalizeActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao finalizar atividade.' });
    });
  });

  describe('startActivity', () => {
    it('404 if not found', async () => {
      req.params.id = 'A15';
      Activity.findById.mockResolvedValue(null);
      await startActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 on success', async () => {
      req.params.id = 'A16';
      Activity.findById.mockResolvedValue({});
      Activity.findByIdAndUpdate.mockResolvedValue();
      await startActivity(req, res);
      expect(Activity.findByIdAndUpdate).toHaveBeenCalledWith('A16', { estado: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Atividade inicializada com sucesso.' });
    });

    it('500 on error', async () => {
      req.params.id = 'A17';
      Activity.findById.mockRejectedValue(new Error());
      await startActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno ao inicializar atividade.' });
    });
  });

  describe('getActivitiesCount', () => {
    it('200 on success', async () => {
      Activity.countDocuments.mockResolvedValue(7);
      await getActivitiesCount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ count: 7 });
    });

    it('500 on error', async () => {
      Activity.countDocuments.mockRejectedValue(new Error());
      await getActivitiesCount(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao contar atividades.' });
    });
  });

  describe('getActivitiesByPlan', () => {
    it('400 if no idPlano', async () => {
      await getActivitiesByPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do plano é obrigatório' });
    });

    it('200 on success', async () => {
      req.params.idPlano = 'P5';
      const fake = [{ _id: 'A1' }];
      Activity.find.mockResolvedValue(fake);
      await getActivitiesByPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('500 on error', async () => {
      req.params.idPlano = 'P6';
      Activity.find.mockRejectedValue(new Error());
      await getActivitiesByPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao buscar atividades por plano.' });
    });
  });

  describe('getActivitiesPublic', () => {
    it('200 on success', async () => {
      req.params.id = 'P7';
      const fake = [{ _id: 'A2' }];
      Activity.find.mockResolvedValue(fake);
      await getActivitiesPublic(req, res);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('500 on error', async () => {
      req.params.id = 'P8';
      Activity.find.mockRejectedValue(new Error());
      await getActivitiesPublic(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao buscar atividades' });
    });
  });
});
