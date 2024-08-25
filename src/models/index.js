const Educations = require('./educationModel');
const Recomendation = require('./recomendationModel');
const SideEffects = require('./sideEffectsModel');

// Define associations here
Educations.hasMany(Recomendation, {
  foreignKey: 'id_education',
  as: 'recomendations'
});

Recomendation.belongsTo(Educations, {
  foreignKey: 'id_education',
  as: 'education'
});

Recomendation.belongsTo(SideEffects, {
  foreignKey: 'id_side_effect',
  as: 'side_effect'
});

module.exports = {
  Educations,
  Recomendation,
  SideEffects
};
