import { z } from 'zod';
import { dateFormats } from './common';

export const serverTimeSchema = z.string().regex(dateFormats.time);

export const serverTimeIsoSchema = z.string().regex(dateFormats.timeIso);

export const disableAccessTokenParamsSchema = z.object({});

export const disableAccessTokenResponseSchema = z.void();
