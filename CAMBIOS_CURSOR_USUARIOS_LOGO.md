# Ajustes realizados

- El cursor de colibrí ahora mide la mitad (37 px en lugar de 74 px).
- El punto visual del mouse queda alineado con la punta del pico.
- El panel `/admin` permite seleccionar uno, varios o todos los usuarios visibles.
- Se añadió eliminación masiva con confirmación.
- Al exportar CSV, si hay usuarios seleccionados se exportan solo esos registros.
- El logotipo ya no se amplía ni se recorta.
- Se añadió un aro naranja exterior mediante CSS y se conserva completa la imagen original.

## Persistencia de mapas

Los mapas ya publicados en Supabase no se eliminan al actualizar el código ni al hacer un redeploy en Vercel. Solo es necesario volver a subirlos cuando se quiere reemplazar sus archivos o cuando se cambia a otro proyecto de Supabase.
