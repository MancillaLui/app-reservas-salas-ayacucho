CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.perfiles (
  id uuid PRIMARY KEY, email text NOT NULL DEFAULT '',
  rol text NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('CLIENTE','ADMIN'))
);
CREATE TABLE IF NOT EXISTS public.salas (
  id uuid PRIMARY KEY, nombre text NOT NULL, categoria text NOT NULL DEFAULT 'Sala',
  precio_centimos integer NOT NULL CHECK(precio_centimos > 0),
  stock integer NOT NULL DEFAULT 1 CHECK(stock = 1), activo boolean NOT NULL DEFAULT true,
  descripcion text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS public.equipos (
  id uuid PRIMARY KEY, nombre text NOT NULL, categoria text NOT NULL,
  precio_centimos integer NOT NULL CHECK(precio_centimos > 0),
  stock integer NOT NULL CHECK(stock > 0), activo boolean NOT NULL DEFAULT true,
  descripcion text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS public.reservas (
  id uuid PRIMARY KEY, cliente_id uuid REFERENCES public.perfiles(id),
  sala_id uuid NOT NULL REFERENCES public.salas(id), inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL, estado text NOT NULL CHECK(estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA','CANCELADA','EXPIRADA')),
  tipo text NOT NULL DEFAULT 'RESERVA' CHECK(tipo IN ('RESERVA','BLOQUEO')),
  total_centimos integer NOT NULL CHECK(total_centimos >= 0), vence_en timestamptz,
  motivo text, creada_en timestamptz NOT NULL DEFAULT now(),
  CHECK(fin > inicio), CHECK(tipo = 'BLOQUEO' OR cliente_id IS NOT NULL),
  CONSTRAINT reservas_sala_sin_cruces EXCLUDE USING gist
    (sala_id WITH =, tstzrange(inicio,fin,'[)') WITH &&)
    WHERE (estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA'))
);
CREATE TABLE IF NOT EXISTS public.reserva_equipos (
  reserva_id uuid NOT NULL REFERENCES public.reservas(id), equipo_id uuid NOT NULL REFERENCES public.equipos(id),
  cantidad integer NOT NULL CHECK(cantidad > 0), precio_centimos integer NOT NULL CHECK(precio_centimos > 0),
  PRIMARY KEY(reserva_id,equipo_id)
);
CREATE TABLE IF NOT EXISTS public.pagos (
  id uuid PRIMARY KEY, reserva_id uuid NOT NULL UNIQUE REFERENCES public.reservas(id),
  clave text NOT NULL, monto_centimos integer NOT NULL CHECK(monto_centimos > 0),
  estado text NOT NULL CHECK(estado IN ('PROCESANDO','APROBADO','RECHAZADO','INCIERTO')),
  referencia text, reembolso_pendiente boolean NOT NULL DEFAULT false,
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid PRIMARY KEY, reserva_id uuid NOT NULL REFERENCES public.reservas(id),
  tipo text NOT NULL DEFAULT 'CONFIRMACION', escenario text NOT NULL CHECK(escenario IN ('normal','demora','fallo')),
  estado text NOT NULL DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE','ENVIANDO','ENVIADA','FALLIDA')),
  comprobante jsonb NOT NULL, intentos integer NOT NULL DEFAULT 0,
  error text, creada_en timestamptz NOT NULL DEFAULT now(), actualizada_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reserva_id,tipo)
);
CREATE INDEX IF NOT EXISTS reservas_cliente ON public.reservas(cliente_id, creada_en DESC);
CREATE INDEX IF NOT EXISTS reservas_vencimiento ON public.reservas(vence_en) WHERE estado='PENDIENTE';
CREATE INDEX IF NOT EXISTS reserva_equipos_equipo ON public.reserva_equipos(equipo_id);
CREATE INDEX IF NOT EXISTS notificaciones_pendientes ON public.notificaciones(estado,creada_en);

-- Business data is server-only. Authenticated browsers access it through the authorized REST API.
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON public.perfiles,public.salas,public.equipos,public.reservas,public.reserva_equipos,public.pagos,public.notificaciones FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
    REVOKE ALL ON public.perfiles,public.salas,public.equipos,public.reservas,public.reserva_equipos,public.pagos,public.notificaciones FROM authenticated;
  END IF;
END $$;
