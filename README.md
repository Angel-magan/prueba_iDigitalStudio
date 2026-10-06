# Prueba Técnica Full Stack Developer - iDigital Studios

## Supuestos Técnicos

- **Formato de Periodo:** El campo `Periodo` se maneja bajo el formato estándar `'YYYY-MM'` (ejemplo: `'2026-09'`).
- **Protección contra doble envío:** Se implementó control de concurrencia en memoria en el backend para evitar peticiones duplicadas simultáneas, además de verificación del estado dentro de una transacción con Prisma.
- **Resiliencia en Frontend:** Si el backend no está disponible al momento de la prueba visual, la aplicación utiliza un mock local para permitir la navegación y evaluación completa de la pantalla.

---

## Parte 4: Diagnóstico de Incidente

**Reporte del usuario:**  
_"La planilla de septiembre aparece como 'Enviada a SAP' pero contabilidad no la ve en SAP."_

### 1. ¿Qué preguntas haría al usuario?

1. ¿Cuál es el ID o número de documento exacto de la planilla y en qué sociedad/empresa de SAP la están buscando?
2. ¿Bajo qué pantalla o transacción de SAP están realizando la búsqueda (ej. Asientos Contables / Journal Entry) y con qué filtros de fecha?
3. ¿Revisaron si el registro ingresó como documento preliminar o borrador (Draft) en lugar de asiento definitivo?
4. ¿El usuario con el que consultan tiene restricciones de permisos por centro de costo o serie contable?

### 2. ¿Qué revisaría y en qué orden?

1. **Frontend:** Inspeccionar en la consola y pestaña Red (Network) el código HTTP retornado (200, 500, etc.) y la respuesta devuelta por el endpoint `/api/planillas/:id/enviar-sap`.
2. **Backend:** Revisar logs del servidor en busca de excepciones, timeouts hacia SAP o fallos en el bloque de captura de errores durante la petición.
3. **Prisma / SQL Server:** Verificar directamente en base de datos el valor de `Estado` de la planilla y si se registraron campos de confirmación devueltos por SAP (`DocEntry` / `DocNum`).
4. **SAP (Service Layer / API):** Consultar los logs de auditoría de la Service Layer de SAP para validar si la solicitud llegó, si fue rechazada por reglas contables o si falló la autenticación.

### 3. Tres posibles causas raíz

1. **Falta de atomicidad en el backend:** El sistema actualizó el estado a `'EnviadaSAP'` antes de validar la confirmación exitosa de SAP, o capturó un timeout de red y no revirtió el estado.
2. **Rechazo contable o guardado como borrador en SAP:** El documento fue rechazado por tener el periodo contable cerrado en SAP o quedó almacenado en la tabla de borradores (`ODRF`) en lugar de los asientos definitivos.
3. **Expiración de credenciales (B1SESSION):** La sesión del Service Layer de SAP expiró al momento del envío, generando un error 401 no gestionado adecuadamente.

### 4. Documentación del incidente (Post-Mortem)

- **Problema:** La planilla del periodo `2026-09` aparece con estado `'EnviadaSAP'` en el sistema interno, pero el departamento contable no visualiza el asiento en SAP.
- **Causa:** La petición HTTP hacia SAP Service Layer sufrió un timeout tras 30 segundos. Por un manejo inadecuado del flujo, el backend dio por exitosa la operación y actualizó el estado en base de datos sin haber obtenido un `DocEntry` válido de confirmación.
- **Solución:**
  - _Inmediata:_ Reenvío manual del registro a SAP y confirmación del asiento generado.
  - _Correctiva:_ Refactorización del servicio backend para que el cambio de estado a `'EnviadaSAP'` solo ocurra de forma transaccional una vez recibida una respuesta HTTP exitosa (201 Created) con identificador de SAP.
  - _Preventiva:_ Implementación de logs de trazabilidad con el ID de transacción de SAP y alertas ante fallos de sincronización.
