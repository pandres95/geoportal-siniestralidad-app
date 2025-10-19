# Guía del Usuario: Geoportal de Siniestralidad Vial

## Introducción

Bienvenido al Geoportal de Siniestralidad Vial, una herramienta interactiva desarrollada por la Universidad Nacional de Colombia para visualizar y analizar datos de accidentes de tránsito que involucran a víctimas juveniles. Esta aplicación permite explorar patrones de siniestralidad vial en Bogotá y sus alrededores, facilitando la toma de decisiones para mejorar la seguridad vial.

## Acceso a la Aplicación

Para acceder al geoportal, navegue a la URL proporcionada por el administrador del sistema. La aplicación se carga completamente en el navegador web y no requiere instalación adicional.

## Interfaz Principal

La interfaz principal consta de tres componentes principales:

1. **Barra de Navegación Superior**: Contiene controles para filtros, modos de visualización y capas adicionales
2. **Panel de Filtros Lateral**: Permite filtrar los datos por diferentes criterios
3. **Mapa Interactivo**: Muestra los datos visualizados según los filtros aplicados

*[Captura de pantalla de la interfaz principal]*

## Funcionalidades Principales

### 1. Visualización de Datos de Víctimas

La aplicación muestra datos de víctimas de accidentes de tránsito juveniles con diferentes modos de visualización:

#### Modo Puntos (Predeterminado)

- Cada punto representa una víctima individual
- Los colores indican el estado de la víctima:
  - **Azul**: Ileso
  - **Amarillo**: Herido
  - **Rojo**: Muerto

*[Captura de pantalla del modo puntos]*

#### Modo Mapa de Calor

- Muestra densidades de accidentes en áreas específicas
- Las zonas más calientes (rojas) indican mayor concentración de incidentes

*[Captura de pantalla del modo mapa de calor]*

### 2. Filtros de Datos

El panel lateral permite filtrar los datos por varios criterios:

#### Filtros Disponibles

- **Edad**: Rango de edad de las víctimas (8-50 años)
- **Estado**: Estado de la víctima (Ileso, Herido, Muerto)
- **Condición**: Rol de la víctima en el accidente (Ciclista, Conductor, Motociclista, Pasajero, Peatón)
- **Fecha**: Rango de fechas del accidente
- **Género**: Género de la víctima (Femenino, Masculino, Sin Información)

*[Captura de pantalla del panel de filtros abierto]*

### 3. Capas Adicionales

#### Escuelas

- Muestra la ubicación de instituciones educativas
- Útil para análisis de seguridad alrededor de zonas escolares

*[Captura de pantalla con capa de escuelas activada]*

#### ZAT (Zonas de Atención Temprana)

- Muestra áreas designadas para intervención prioritaria en seguridad vial

*[Captura de pantalla con capa ZAT activada]*

## Cómo Usar la Aplicación

### Paso 1: Abrir el Panel de Filtros

1. Haga clic en el ícono de filtro en la barra de navegación superior
2. El panel lateral se expandirá mostrando las opciones de filtrado

### Paso 2: Aplicar Filtros

1. Expanda cada sección de filtro haciendo clic en el título
2. Ajuste los controles según sus necesidades:
   - Use los deslizadores para rangos numéricos
   - Seleccione múltiples opciones en listas desplegables
   - Elija valores únicos en menús desplegables

### Paso 3: Cambiar Modo de Visualización

1. Haga clic en el ícono de mapa de calor/puntos en la barra de navegación
2. La visualización cambiará automáticamente
3. Espere a que se complete la transición (indicada por el ícono de carga)

### Paso 4: Activar Capas Adicionales

1. Use los íconos de escuela y mapa en la barra de navegación
2. Los íconos cambiarán de color cuando las capas estén activas
3. Los datos adicionales aparecerán en el mapa

### Paso 5: Explorar el Mapa

- **Zoom**: Use la rueda del mouse o los controles del mapa
- **Pan**: Arrastre el mapa con el mouse
- **Información**: Pase el cursor sobre puntos para ver detalles (si implementado)

## Consejos de Uso

1. **Filtros Combinados**: Puede aplicar múltiples filtros simultáneamente para análisis específicos
2. **Rendimiento**: Los cambios de visualización pueden tomar unos segundos en procesarse
3. **Datos en Tiempo Real**: Los datos se actualizan automáticamente cuando cambian los filtros
4. **Compatibilidad**: La aplicación funciona mejor en navegadores modernos (Chrome, Firefox, Safari, Edge)

## Solución de Problemas

### La aplicación no carga

- Verifique su conexión a internet
- Actualice la página
- Limpie la caché del navegador

### Los filtros no responden

- Asegúrese de que el panel lateral esté abierto
- Verifique que los valores de filtro sean válidos
- Recargue la página si es necesario

### El mapa no se muestra correctamente

- Verifique que JavaScript esté habilitado en su navegador
- Intente recargar la página
- Use un navegador diferente si el problema persiste

## Información Técnica

- **Tecnologías**: Next.js, React, Leaflet, Material-UI
- **Datos**: Información de siniestralidad vial juvenil en Bogotá
- **Actualización**: Los datos se refrescan automáticamente según los filtros aplicados
- **Privacidad**: La aplicación no almacena datos personales del usuario

## Soporte

Para soporte técnico o preguntas sobre el uso de la aplicación, contacte al equipo de desarrollo de la Universidad Nacional de Colombia.

---

*Esta guía está basada en la versión actual de la aplicación. Las funcionalidades pueden variar en futuras actualizaciones.*
