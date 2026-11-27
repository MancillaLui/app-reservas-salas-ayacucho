const ref=(name:string)=>({$ref:`#/components/schemas/${name}`});
const json=(schema:unknown)=>({'application/json':{schema}});
const uuid={type:'string',format:'uuid'};
const fecha={type:'string',format:'date-time',example:'2026-12-01T18:00:00-05:00'};
const parametroId={name:'id',in:'path',required:true,schema:uuid};
const errores={400:{description:'Datos o JSON inválidos',content:json(ref('Error'))},401:{description:'Token ausente o inválido',content:json(ref('Error'))},403:{description:'Rol o propiedad insuficiente',content:json(ref('Error'))},404:{description:'Recurso no encontrado',content:json(ref('Error'))},409:{description:'Conflicto de stock, horario, estado o idempotencia',content:json(ref('Error'))},503:{description:'Servicio no configurado, no disponible o pago incierto',content:json(ref('Error'))}};
function operacion(summary:string,schema:unknown,options:{body?:unknown;status?:number;public?:boolean;parameters?:unknown[];tag?:string}={}) {
  return {summary,tags:[options.tag??'Reservas'],security:options.public?[]:[{BearerAuth:[]}],
    ...(options.parameters?{parameters:options.parameters}:{}),
    ...(options.body?{requestBody:{required:true,content:json(options.body)}}:{}),
    responses:{[options.status??200]:{description:'Operación completada',...(options.status===204?{}:{content:json(schema)})},...errores}};
}
const paths:Record<string,unknown>={
  '/calendario':{get:operacion('Consultar intervalos ocupados de una sala en un día de Lima; sin identidades ni motivos',{type:'array',items:{type:'object',properties:{inicio:fecha,fin:fecha}}},{public:true,tag:'Catálogo',parameters:[{name:'salaId',in:'query',required:true,schema:uuid},{name:'fecha',in:'query',required:true,schema:{type:'string',format:'date'}}]})},
  '/health':{get:operacion('Comprobar conectividad con PostgreSQL',{type:'object',properties:{status:{type:'string'},pagos:{type:'string'},mensajeria:{type:'string'}}},{public:true,tag:'Sistema'})},
  '/yo':{get:operacion('Identidad y rol obtenidos del servidor',ref('Actor'),{tag:'Usuarios'})},
  '/disponibilidad':{get:operacion('Consultar disponibilidad sin caché',ref('Disponibilidad'),{public:true,tag:'Catálogo',parameters:['inicio','fin'].map(name=>({name,in:'query',required:true,schema:fecha}))})},
  '/reservas':{get:operacion('Listar reservas propias; administrador ve todas',{type:'array',items:ref('Reserva')}),post:operacion('Crear reserva pendiente por diez minutos',ref('Reserva'),{body:ref('CrearReserva'),status:201})},
  '/reservas/{id}':{get:operacion('Consultar una reserva autorizada',ref('Reserva'),{parameters:[parametroId]})},
  '/reservas/{id}/cancelacion':{post:operacion('Cancelar antes del inicio; administrador por fuerza mayor',ref('Reserva'),{parameters:[parametroId],body:ref('Motivo')})},
  '/reservas/{id}/pago':{post:operacion('Procesar pago SIMULADO e idempotente; un rechazo cancela la reserva',ref('Reserva'),{parameters:[parametroId,{name:'Idempotency-Key',in:'header',required:true,schema:{type:'string',minLength:8,maxLength:120}}],body:{type:'object',additionalProperties:false,properties:{escenario:{type:'string',enum:['aprobado','rechazado','demora','fallo'],default:'aprobado'},mensaje:{type:'string',enum:['normal','demora','fallo'],default:'normal'}}}})},
  '/admin/reservas':{get:operacion('Agenda administrativa (hasta 200 reservas)',{type:'array',items:ref('Reserva')},{tag:'Administración'})},
  '/admin/bloqueos':{get:operacion('Listar bloqueos activos',{type:'array',items:ref('Reserva')},{tag:'Administración'}),post:operacion('Bloquear una sala libre por mantenimiento',ref('Reserva'),{body:ref('Bloqueo'),status:201,tag:'Administración'})},
  '/admin/bloqueos/{id}':{delete:operacion('Desbloquear horario',{}, {status:204,parameters:[parametroId],tag:'Administración'})},
  '/admin/pagos':{get:operacion('Consultar pagos e importes pendientes de reembolso',{type:'array',items:ref('Pago')},{tag:'Administración'})},
  '/admin/pagos/{id}/conciliacion':{post:operacion('Resolver manualmente un pago INCIERTO del simulador',ref('Reserva'),{parameters:[parametroId],body:{type:'object',required:['aprobado'],additionalProperties:false,properties:{aprobado:{type:'boolean'}}},tag:'Administración'})},
  '/admin/notificaciones':{get:operacion('Consultar comprobantes y resultados de mensajería simulada',{type:'array',items:ref('Notificacion')},{tag:'Administración'})}
};
for(const tipo of ['salas','equipos']) {
  paths[`/${tipo}`]={get:operacion(`Consultar ${tipo} activos (caché interna 30 s)`,{type:'array',items:ref('Recurso')},{public:true,tag:'Catálogo',parameters:[{name:'categoria',in:'query',schema:{type:'string'}}]})};
  paths[`/admin/${tipo}`]={get:operacion(`Listar ${tipo}, incluidos inactivos`,{type:'array',items:ref('Recurso')},{tag:'Administración'}),post:operacion(`Crear recurso en ${tipo}`,ref('Recurso'),{body:ref('DatosRecurso'),status:201,tag:'Administración'})};
  paths[`/admin/${tipo}/{id}`]={put:operacion(`Actualizar recurso en ${tipo}`,ref('Recurso'),{parameters:[parametroId],body:ref('DatosRecurso'),tag:'Administración'}),delete:operacion('Desactivar sin borrar historial',{}, {status:204,parameters:[parametroId],tag:'Administración'})};
}
const equipoPedido={type:'object',additionalProperties:false,required:['equipoId','cantidad'],properties:{equipoId:uuid,cantidad:{type:'integer',minimum:1,maximum:1000}}};
const datos={type:'object',additionalProperties:false,required:['nombre','categoria','precio_centimos'],properties:{nombre:{type:'string',minLength:2,maxLength:100},categoria:{type:'string',minLength:1,maxLength:60},precio_centimos:{type:'integer',minimum:1,maximum:10000000},stock:{type:'integer',minimum:1,maximum:1000,default:1},activo:{type:'boolean',default:true},descripcion:{type:'string',maxLength:500,default:''}}};
export const openapi={openapi:'3.0.3',info:{title:'Reservas de Salas Ayacucho',version:'2.0.0',description:'Sprint 2. API REST con Supabase Auth. Pagos y mensajería SIMULADOS. Los importes son céntimos PEN; los extras se cobran por ensayo. Inicio incluido y fin excluido. Máximo 24 horas por reserva. Usa Authorize con el access_token de Supabase.'},servers:[{url:'/api/v1'}],paths,components:{securitySchemes:{BearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}},schemas:{
  Error:{type:'object',properties:{error:{type:'object',properties:{code:{type:'string'},message:{type:'string'},detalles:{type:'array',items:{type:'object'}}}}}},
  Actor:{type:'object',properties:{id:uuid,email:{type:'string'},role:{type:'string',enum:['CLIENTE','ADMIN']}}},
  DatosRecurso:datos,Recurso:{...datos,required:[...datos.required,'id'],properties:{...datos.properties,id:uuid}},
  CrearReserva:{type:'object',additionalProperties:false,required:['salaId','inicio','fin'],properties:{salaId:uuid,inicio:fecha,fin:fecha,equipos:{type:'array',maxItems:50,items:equipoPedido,default:[]}}},
  Reserva:{type:'object',properties:{id:uuid,cliente_id:{...uuid,nullable:true},sala_id:uuid,sala_nombre:{type:'string'},inicio:fecha,fin:fecha,estado:{type:'string',enum:['PENDIENTE','PROCESANDO','CONFIRMADA','CANCELADA','EXPIRADA']},tipo:{type:'string',enum:['RESERVA','BLOQUEO']},total_centimos:{type:'integer'},vence_en:{...fecha,nullable:true},motivo:{type:'string',nullable:true},creada_en:fecha,equipos:{type:'array',items:{type:'object',properties:{equipo_id:uuid,cantidad:{type:'integer'},precio_centimos:{type:'integer'},nombre:{type:'string'}}}}}},
  Motivo:{type:'object',additionalProperties:false,required:['motivo'],properties:{motivo:{type:'string',minLength:3,maxLength:300}}},
  Bloqueo:{type:'object',additionalProperties:false,required:['salaId','inicio','fin','motivo'],properties:{salaId:uuid,inicio:fecha,fin:fecha,motivo:{type:'string',minLength:3,maxLength:300}}},
  Disponibilidad:{type:'object',properties:{salas:{type:'array',items:{type:'object',properties:{id:uuid,disponible:{type:'boolean'}}}},equipos:{type:'array',items:{type:'object',properties:{id:uuid,disponible:{type:'integer',minimum:0}}}}}},
  Pago:{type:'object',properties:{id:uuid,reserva_id:uuid,clave:{type:'string'},monto_centimos:{type:'integer'},estado:{type:'string',enum:['PROCESANDO','APROBADO','RECHAZADO','INCIERTO']},referencia:{type:'string',nullable:true},reembolso_pendiente:{type:'boolean'},creado_en:fecha}},
  Notificacion:{type:'object',properties:{id:uuid,reserva_id:uuid,tipo:{type:'string'},escenario:{type:'string'},estado:{type:'string',enum:['PENDIENTE','ENVIANDO','ENVIADA','FALLIDA']},intentos:{type:'integer'},comprobante:{type:'object'},error:{type:'string',nullable:true},creada_en:fecha,actualizada_en:fecha}}
}}};
