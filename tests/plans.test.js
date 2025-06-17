// plans.test.js

jest.mock("../backend/models/plan.model.js", () => {
  const m = jest.fn();
  m.find = jest.fn();
  m.findById = jest.fn();
  m.findOne = jest.fn();
  m.countDocuments = jest.fn();
  m.findByIdAndDelete = jest.fn();
  m.findByIdAndUpdate = jest.fn();
  return m;
});

jest.mock("../backend/models/user.model.js", () => {
  const m = jest.fn();
  m.findById = jest.fn();
  return m;
});

jest.mock("../backend/models/activity.model.js", () => {
  const m = jest.fn();
  m.findOne = jest.fn();
  m.find = jest.fn();
  return m;
});

jest.mock("../backend/utils/nodemailer.js", () => ({
  enviarEmailNotificação: jest.fn().mockResolvedValue(),
}));

jest.mock("../backend/utils/upload.js", () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

jest.mock("../backend/utils/errorHandler.js", () => ({
  handleError: jest.fn((res, errorCode) => {
    const statusMap = {
      PLAN_NOT_FOUND: 404,
      PLAN_CREATION_BAD_REQUEST: 400,
      PLAN_CREATION_INVALID_DATE: 400,
      PLAN_CREATION_DUPLICATE: 409,
      PLAN_DELETE_BLOCKED: 400,
      PLAN_CANNOT_DELETE: 400,
    };
    return res.status(statusMap[errorCode] || 500).json({ errorCode });
  }),
}));

const Plan = require("../backend/models/plan.model.js");
const User = require("../backend/models/user.model.js");
const Activity = require("../backend/models/activity.model.js");
const { enviarEmailNotificação } = require("../backend/utils/nodemailer.js");
const { cloudinary } = require("../backend/utils/upload.js");

const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  finalizePlan,
  startPlan,
  getPublicPlanNames,
  countActivePlans,
  getPlanByIdPublic,
} = require("../backend/controllers/plans.controller.js");

describe("Plans Controller", () => {
  let req, res;
  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      files: [],
      user: { userId: "U1" },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe("getAllPlans", () => {
    it("200 without filters", async () => {
      const fake = [{ nome: "P1" }];
      Plan.find.mockResolvedValue(fake);
      await getAllPlans(req, res);
      expect(Plan.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("applies filters", async () => {
      const fake = [];
      req.query = { nome: "X", estado: "true" };
      Plan.find.mockResolvedValue(fake);
      await getAllPlans(req, res);
      expect(Plan.find).toHaveBeenCalledWith({ nome: "X", estado: "true" });
    });

    it("500 on error", async () => {
      Plan.find.mockRejectedValue(new Error());
      await getAllPlans(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao buscar planos.",
      });
    });
  });

  describe("getPlanById", () => {
    it("200 on found", async () => {
      const fake = { _id: "P1" };
      Plan.findById.mockReturnValue({ populate: () => Promise.resolve(fake) });
      req.params.id = "P1";
      await getPlanById(req, res);
      expect(Plan.findById).toHaveBeenCalledWith("P1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("404 if not found", async () => {
      Plan.findById.mockReturnValue({ populate: () => Promise.resolve(null) });
      req.params.id = "P2";
      await getPlanById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "PLAN_NOT_FOUND" })
      );
    });

    it("500 on error", async () => {
      Plan.findById.mockReturnValue({
        populate: () => Promise.reject(new Error()),
      });
      req.params.id = "P3";
      await getPlanById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao obter plano.",
      });
    });
  });

  describe("createPlan", () => {
    const base = {
      nome: "N",
      descricao: "D",
      data_inicio: "2025-01-01",
      data_fim: "2025-02-01",
      nivel: "A",
      estado: "true",
    };

    it("400 if missing fields", async () => {
      req.body = {};
      await createPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("400 if invalid dates order", async () => {
      req.body = { ...base, data_inicio: "2025-03-01", data_fim: "2025-02-01" };
      await createPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "PLAN_CREATION_INVALID_DATE" })
      );
    });

    it("409 on duplicate name", async () => {
      req.body = base;
      Plan.findOne.mockResolvedValue({ nome: "N" });
      await createPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "PLAN_CREATION_DUPLICATE" })
      );
    });

    it("201 on success", async () => {
      req.body = base;
      Plan.findOne.mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue();
      Plan.mockImplementation(() => ({ _id: "P1", save: saveMock }));
      User.findById.mockResolvedValue({ name: "U" });
      await createPlan(req, res);
      expect(saveMock).toHaveBeenCalled();
      expect(enviarEmailNotificação).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plano de atividades criado com sucesso!",
        planoId: "P1",
      });
    });

    it("500 on internal error", async () => {
      req.body = base;
      Plan.findOne.mockResolvedValue(null);
      jest.spyOn(Plan, "findOne").mockRejectedValue(new Error());
      await createPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao criar plano.",
      });
    });
  });

  describe("updatePlan", () => {
    it("400 if no fields", async () => {
      req.body = {};
      await updatePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("400 invalid date", async () => {
      req.body = { data_inicio: "bad" };
      await updatePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("404 if not found", async () => {
      req.body = { nome: "X" };
      Plan.findById.mockResolvedValue(null);
      req.params.id = "P2";
      await updatePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("200 on success", async () => {
      const plan = { save: jest.fn().mockResolvedValue() };
      Plan.findById.mockResolvedValue(plan);
      req.params.id = "P3";
      req.body = { nome: "Y" };
      await updatePlan(req, res);
      expect(plan.nome).toBe("Y");
      expect(plan.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plano de atividades atualizado com sucesso!",
      });
    });

    it("500 on error", async () => {
      req.body = { nome: "X" };
      Plan.findById.mockRejectedValue(new Error());
      await updatePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao atualizar plano.",
      });
    });
  });

  describe("deletePlan", () => {
    it("404 if not found", async () => {
      Plan.findById.mockResolvedValue(null);
      await deletePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("400 if ongoing activity", async () => {
      Plan.findById.mockResolvedValue({ estado: false, recursos: [] });
      Activity.findOne.mockResolvedValue({});
      await deletePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "PLAN_DELETE_BLOCKED" })
      );
    });

    it("400 if still active", async () => {
      Plan.findById.mockResolvedValue({ estado: true, recursos: [] });
      Activity.findOne.mockResolvedValue(null);
      await deletePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "PLAN_CANNOT_DELETE" })
      );
    });

    it("200 on success", async () => {
      Plan.findById.mockResolvedValue({
        estado: false,
        recursos: [{ cloudinary_id: "C1" }],
      });
      Activity.findOne.mockResolvedValue(null);
      Plan.findByIdAndDelete.mockResolvedValue();
      await deletePlan(req, res);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("C1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plano de atividades removido com sucesso.",
      });
    });

    it("500 on error", async () => {
      Plan.findById.mockRejectedValue(new Error());
      await deletePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao remover plano.",
      });
    });
  });

  describe("finalizePlan", () => {
    it("404 if not found", async () => {
      Plan.findById.mockResolvedValue(null);
      await finalizePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("400 if ongoing activity", async () => {
      Plan.findById.mockResolvedValue({ recursos: [], estado: true });
      Activity.findOne.mockResolvedValue({});
      await finalizePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "PLAN_DELETE_BLOCKED" })
      );
    });

    it("200 on success", async () => {
      Plan.findById.mockResolvedValue({
        recursos: [],
        estado: true,
        save: jest.fn().mockResolvedValue(),
      });
      Activity.findOne.mockResolvedValue(null);
      req.files = [{ path: "p1" }];
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: "url1",
        public_id: "id1",
      });
      await finalizePlan(req, res);
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith("p1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plano de atividades finalizado com sucesso.",
      });
    });

    /* it("500 on error", async () => {
      Plan.findById.mockRejectedValue(new Error());
      await finalizePlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao finalizar plano.",
      });
    }); */
  });

  describe("startPlan", () => {
    it("404 if not found", async () => {
      Plan.findById.mockResolvedValue(null);
      await startPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("200 on start", async () => {
      // Set id to avoid undefined
      req.params.id = "P1";
      Plan.findById.mockResolvedValue({});
      Plan.findByIdAndUpdate.mockResolvedValue();
      await startPlan(req, res);
      expect(Plan.findByIdAndUpdate).toHaveBeenCalledWith("P1", {
        estado: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plano inicializad com sucesso.",
      });
    });

    it("500 on error", async () => {
      Plan.findById.mockRejectedValue(new Error());
      await startPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno ao inicializar plano.",
      });
    });
  });

  describe("getPublicPlanNames", () => {
    it("200 on success", async () => {
      const fake = [{ nome: "P1", _id: "1" }];
      Plan.find.mockResolvedValue(fake);
      await getPublicPlanNames(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

  });
});
