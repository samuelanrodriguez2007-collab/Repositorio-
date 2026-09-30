# Origen Directo

Sitio web para una plataforma que conecta **caficultores** con **tiendas de café especial** y se encarga de toda la **logística**: recoger el café en la finca, procesarlo (trilla, tostión, empaque) y entregarlo listo en la tienda.

## Modelo de negocio

1. **Conexión**: comisión del 8% sobre el valor del lote cuando se cierra un acuerdo entre finca y tienda.
2. **Logística**: tarifa por kg que cubre recolección, procesamiento y transporte hasta la tienda.

## Secciones

- Inicio con la ruta finca → procesamiento → tienda
- Cómo funciona: los dos servicios y el proceso en 6 pasos
- Beneficios para caficultores y para tiendas
- Catálogo de lotes con filtros por región, proceso y puntaje, y botón para pedir muestra
- Tarifas y cotizador de logística interactivo
- Formulario de registro para caficultores o tiendas

## Cómo verlo

Es un sitio estático, sin dependencias. Abre `index.html` en el navegador, o sírvelo localmente:

```bash
python3 -m http.server 8000
# luego visita http://localhost:8000
```

## Estructura

```
index.html      Página principal
css/styles.css  Estilos (responsive)
js/app.js       Lotes, filtros, cotizador, formulario y animaciones
```

> Los lotes son datos de ejemplo y los registros se guardan en el navegador (`localStorage`). Para producción se debe conectar el formulario a un backend o servicio de correo.
