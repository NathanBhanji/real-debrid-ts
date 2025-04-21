import { z } from 'zod';

export const errorCodeSchema = z.enum([
  '-1',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
]);

export const errorResponseSchema = z.object({
  error: z.string(),
  error_code: errorCodeSchema.optional(),
});

// Date format regex patterns
export const dateFormats = {
  time: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // Y-m-d H:i:s
  timeIso: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, // Y-m-dTH:i:sO
  dateOnly: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
} as const;

// Common validation refinements
export const dateRangeRefinement = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 31;
};
