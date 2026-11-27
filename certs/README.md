# Certificado público de Supabase

`supabase-prod-ca-2021.crt` contiene Supabase Root 2021 CA. Es un certificado público, no una credencial ni una clave privada.

- Origen: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt
- Vencimiento: 26 de abril de 2031.
- Huella SHA-256: `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`.

La variable `DATABASE_SSL_CA_FILE` permite utilizarlo exclusivamente para PostgreSQL, manteniendo `rejectUnauthorized: true` y la verificación del hostname. No se modifica el almacén de certificados del sistema operativo. Si Supabase cambia su autoridad, descarga el certificado correspondiente desde Database Settings → SSL Configuration y verifica la conexión nuevamente.

Referencia: [SSL en Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement).
