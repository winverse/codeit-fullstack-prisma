export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // zod 에러가 발생하면, 400 Bad Request 응답
    const validationErrors = error.errors.map((err) => err.message);
    res.status(400).json({ errors: validationErrors });
  }
};
