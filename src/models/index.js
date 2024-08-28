const Educations = require('./educationModel');
const Recomendation = require('./recomendationModel');
const SideEffects = require('./sideEffectsModel');

// Define associations here
Educations.hasMany(Recomendation, {
  foreignKey: 'id_education',
  as: 'recomendations', // Association alias
});

Recomendation.belongsTo(Educations, {
  foreignKey: 'id_education',
  as: 'education', // Ensure consistency
});

Recomendation.belongsTo(SideEffects, {
  foreignKey: 'id_side_effect',
  as: 'sideEffect', // Use camelCase for clarity
});

SideEffects.hasMany(Recomendation, {
  foreignKey: 'id_side_effect',
  as: 'recomendations', // Association alias
});

// Ensure models are exported after associations are defined
module.exports = {
  Educations,
  Recomendation,
  SideEffects,
};
