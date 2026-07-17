# Corrección final: cursor y mapas territoriales

## Cursor

- Se eliminó el segundo cursor circular que cada misión dibujaba por separado.
- Ahora existe un solo cursor global para toda la aplicación.
- El colibrí mide 36 x 27 px.
- El hotspot está colocado exactamente en la punta del pico.
- Las animaciones de hover y clic nacen desde el pico, por lo que el punto de clic no se desplaza.

## Territorio

- Los archivos fuente siguen siendo Shapefile: `.shp`, `.dbf`, `.shx` y `.prj`.
- El navegador los convierte a GeoJSON optimizado para mostrarlos en la web.
- Cantones y Parroquias se publican en rutas públicas fijas:
  - `territorial/cantones.geojson`
  - `territorial/parroquias.geojson`
- La bienvenida consulta primero la tabla y también prueba directamente esas rutas públicas.
- Si la tabla tarda en actualizarse, el mapa puede cargar igualmente desde Storage.
- El administrador verifica que el archivo publicado realmente pueda descargarse antes de confirmar que quedó compartido.

Después de desplegar esta versión, publica Territorio una sola vez. Las siguientes actualizaciones de código no requieren volver a subir los mapas mientras se conserve el mismo proyecto de Supabase.
