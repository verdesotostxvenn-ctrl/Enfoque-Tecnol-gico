# Corrección de territorio y cursor

## Territorio

- Los archivos originales siguen siendo Shapefile: `.shp`, `.dbf`, `.shx` y `.prj`.
- El navegador los convierte a GeoJSON optimizado para mostrarlos sin congelarse.
- La publicación principal ahora guarda el GeoJSON optimizado dentro de `mapas_recursos.preview_url`.
- Storage queda como respaldo, evitando que la bienvenida dependa de un enlace público que pueda fallar por caché o acceso.
- El panel `/admin/territorio` recupera los mapas existentes del navegador o de Supabase, por lo que permite reparar la publicación pulsando otra vez **Publicar territorio**, sin elegir los archivos nuevamente cuando la copia local sigue disponible.
- La bienvenida reintenta la descarga, evita mostrar instrucciones administrativas a los niños y ofrece un botón para volver a intentar.

## Cursor

- Se eliminó la dependencia de las tres imágenes externas.
- Se añadió un colibrí SVG local, pequeño y sin el círculo naranja.
- El cursor nativo se oculta de forma global y también desde ejecución para evitar que aparezcan dos cursores.
- El punto de clic está colocado en la punta del pico.
- Se quitaron reglas internas de Lobby y Admin que volvían a activar el cursor del sistema.

## Administrador

- Se conserva la selección múltiple de usuarios y las acciones por lote de la versión anterior.
