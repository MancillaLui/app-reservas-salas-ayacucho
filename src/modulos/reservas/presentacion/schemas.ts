import { z } from 'zod';
export const uuid=z.uuid();
export const intervalo=z.object({inicio:z.iso.datetime({offset:true}),fin:z.iso.datetime({offset:true})}).strict();
export const reservaSchema=intervalo.extend({salaId:uuid,equipos:z.array(z.object({equipoId:uuid,cantidad:z.number().int().positive().max(1000)}).strict()).max(50).default([])}).strict();
export const recursoSchema=z.object({nombre:z.string().trim().min(2).max(100),categoria:z.string().trim().min(1).max(60),precio_centimos:z.number().int().positive().max(10000000),stock:z.number().int().positive().max(1000).default(1),activo:z.boolean().default(true),descripcion:z.string().max(500).default('')}).strict();
export const pagoSchema=z.object({escenario:z.enum(['aprobado','rechazado','demora','fallo']).default('aprobado'),mensaje:z.enum(['normal','demora','fallo']).default('normal')}).strict();
export const motivoSchema=z.object({motivo:z.string().trim().min(3).max(300)}).strict();
export const bloqueoSchema=intervalo.extend({salaId:uuid,motivo:z.string().trim().min(3).max(300)}).strict();
