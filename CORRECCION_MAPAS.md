# Corrección de publicación de mapas

## Qué estaba pasando

La ruta `/admin/mapas` usaba `FastMapAdminPage`, que solo guardaba los mapas en IndexedDB del navegador del administrador. Por eso la vista previa funcionaba allí, pero los estudiantes que abrían la web en otro celular, computadora, perfil o navegador no recibían esos datos.

La ruta `/admin/territorio` sí intentaba usar Supabase, pero cuando faltaba el bucket `mapas`, la tabla `mapas_recursos`, sus políticas RLS o las variables correctas en Vercel, retrocedía a almacenamiento local.

## Cambios aplicados

- `/admin/mapas` ahora conserva la copia local y además publica `preview.png` y `raster.json` en Supabase.
- La página pública `/mapas` prioriza la versión compartida de Supabase y usa la copia local solo como respaldo.
- Los mensajes del panel distinguen entre “publicado para todos” y “solo en este navegador”.
- Se añadió `supabase/mapas_setup.sql` para crear la tabla, el bucket y las políticas necesarias.

## Configuración necesaria

1. En el proyecto correcto de Supabase abre **SQL Editor**.
2. Ejecuta todo el archivo `supabase/mapas_setup.sql`.
3. En Vercel comprueba estas variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Haz un redeploy.
5. Vuelve a `/admin/mapas`, selecciona la carpeta y pulsa **Publicar todos los detectados**.
6. El registro debe decir **publicado para todos**. Si dice **solo en este navegador**, el mensaje siguiente indica el error real de Supabase.
7. Publica nuevamente Cantones y Parroquias desde `/admin/territorio`.
