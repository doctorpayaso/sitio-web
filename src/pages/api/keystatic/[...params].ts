// =============================================================================
//  API interna de Keystatic
//  Recibe los cambios del panel y los convierte en commits al repositorio.
//  No la consume nadie más que el propio panel.
// =============================================================================
export const prerender = false;

import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

export const all = makeHandler({ config });
