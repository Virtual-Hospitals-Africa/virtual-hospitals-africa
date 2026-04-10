const weird_plurals = {
  diagnosis: "diagnoses"
};
const pluralize = (word, count) => count === 1 ? word : weird_plurals[word] || `${word}s`;
export {
  pluralize as p
};
