export default function (req, res, next, id) {
  const uesrIdRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uesrIdRegex.test(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  next();
}
