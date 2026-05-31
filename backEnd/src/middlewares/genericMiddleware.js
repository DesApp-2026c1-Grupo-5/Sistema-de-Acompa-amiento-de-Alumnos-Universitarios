const existModelByPk = (Model, source = "params") =>
  async (req, res, next) => {
    const id = req[source]?.id;
    if (id == null) {
      return res.status(400).json({ ok: false, message: "ID requerido" });
    }
    const instance = await Model.findByPk(id);
    if (!instance) {
      return res.status(404).json({ ok: false, message: `${Model.name} no encontrado` });
    }
    req[Model.name] = instance;
    next();
  };

const existModelBy = (Model, field, reqPath) =>
  async (req, res, next) => {
    const value = reqPath.split(".").reduce((acc, k) => acc?.[k], req);
    if (value == null) {
      return res.status(400).json({ ok: false, message: `${field} requerido` });
    }
    const instance = await Model.findOne({ where: { [field]: value } });
    if (!instance) {
      return res.status(404).json({ ok: false, message: `${Model.name} no encontrado` });
    }
    req[Model.name] = instance;
    next();
  };

module.exports = { existModelByPk, existModelBy };
