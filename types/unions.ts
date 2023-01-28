export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = typeof MEALS[number];