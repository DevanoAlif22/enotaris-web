const genCode = () =>
  "ACT-" +
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 6).toUpperCase();

export { genCode };
