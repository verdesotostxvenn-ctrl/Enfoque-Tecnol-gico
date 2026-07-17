# Entrega final — Proyecto Fusilero

## Cambios incluidos

- Logo local completo con el aro naranja visible, sin depender de Blogger ni de caché externa.
- Un único cursor de colibrí en toda la aplicación.
- Colibrí reducido a 34 px de ancho.
- La punta del pico coincide con la coordenada real del clic.
- Eliminados los cursores circulares internos de las tres misiones.
- Selección múltiple de usuarios en `/admin`, con seleccionar todos, limpiar, exportar y eliminar seleccionados.
- Publicación de mapas de amenazas en Supabase mediante `preview.png` y `raster.json` optimizados.
- Publicación territorial de Cantones y Parroquias en rutas fijas de Supabase Storage, con respaldo en la tabla `mapas_recursos`.
- Los mapas publicados no se eliminan al actualizar el código ni requieren volver a subirse en cada deployment.
- Corrección del reinicio de la bienvenida territorial al registrar un nuevo agente.

## Comprobación del deployment

Después de subir este proyecto a GitHub y esperar el deployment de Vercel, abre:

`https://TU-DOMINIO.vercel.app/version.txt`

Debe aparecer `FUSILERO-FINAL-2026-07-17`. Si no aparece, Vercel todavía está desplegando otra carpeta, rama o repositorio.

## Instalación

1. Copia todo el contenido de este proyecto directamente en la raíz del repositorio.
2. No copies la carpeta contenedora como una subcarpeta.
3. Conserva la carpeta `.git` del repositorio.
4. Ejecuta `npm install` y `npm run build` si deseas comprobarlo localmente.
5. Haz commit y push a la rama que Vercel usa para Production.

## Mapas

Los mapas ya publicados en el mismo proyecto de Supabase permanecen guardados. Solo hay que volver a publicarlos cuando se cambien los archivos originales o cuando se conecte otro proyecto de Supabase.
