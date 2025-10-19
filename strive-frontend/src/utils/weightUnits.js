// WeightUnits.js

export const kgToLbs = (kg) => kg * 2.20462;
export const lbsToKg = (lbs) => lbs / 2.20462;

export const formatWeight = (kg, useImperial) => {
  if (useImperial) {
    return `${kgToLbs(kg).toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
};

export const parseWeight = (value, useImperial) => {
  const numValue = parseFloat(value);
  if (useImperial) {
    return lbsToKg(numValue);
  }
  return numValue;
};

export const getWeightUnit = (useImperial) => {
  return useImperial ? 'lbs' : 'kg';
};