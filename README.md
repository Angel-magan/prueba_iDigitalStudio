# Prueba Técnica Full Stack Developer - iDigital Studios

Sistema integral para la gestión, balanceo contable y aprobación de planillas de nómina, con integración simulada hacia SAP Business One y despliegue contenerizado.

---

## 🏗️ Arquitectura y Stack Tecnológico

- **Base de Datos:** Microsoft SQL Server 2022 (Instancia contenerizada / Transact-SQL).
- **Backend:** Node.js, Express, TypeScript, Prisma ORM.
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
- **DevOps / Infraestructura:** Docker & Docker Compose.

---

## 🚀 Despliegue Rápido con Docker (Bonus)

La solución cuenta con aprovisionamiento automatizado que inicializa la base de datos SQL Server, ejecuta el script DDL, crea el Stored Procedure, inserta los datos semilla y levanta la API.

### 1. Iniciar Base de Datos y Backend

Desde la raíz del proyecto:
docker compose up --build

- **Backend API:** http://localhost:3001
- **SQL Server:** Puerto 1433 (Usuario: sa, Contraseña: PasswordSeguro123!)

### 2. Iniciar Frontend

En una nueva terminal:
cd frontend
npm install
npm run dev

Acceder a la aplicación web en: http://localhost:5173

---

## 🛠️ Ejecución en Entorno Local (Alternativa Manual)

### Base de Datos

1. Ejecutar el script database/solucion_parte1.sql en SQL Server Management Studio (SSMS) o Azure Data Studio para crear y poblar la base de datos NominaContabilidadDB.

### Backend

cd backend
npm install

# Configurar archivo .env con la cadena de conexión correspondiente

npx prisma generate
npm run dev

### Frontend

cd frontend
npm install
npm run dev

---

## 📋 Supuestos Técnicos Adoptados

- **Formato de Periodo:** El campo Periodo se maneja bajo el formato estándar 'YYYY-MM' (ejemplo: '2026-09').
- **Protección contra Concurrencia:** Control en memoria y validación transaccional con bloqueo a nivel de registro para prevenir envíos duplicados hacia SAP.
- **Resiliencia en Frontend:** Si el backend no estuviese disponible, la interfaz implementa un fallback a un mock tipado para permitir la evaluación visual.
- **Normalización Numérica:** Conversión explícita de campos Decimal de base de datos a punto flotante en JavaScript para garantizar cálculos contables en tiempo real sin descuadres.

---

## 🗄️ Parte 1: Base de Datos y Consultas Transact-SQL

El archivo con el script completo se encuentra en database/solucion_parte1.sql.

### Consulta A: Total por concepto y por centro de costo en un periodo dado

SELECT
p.Periodo,
cc.Nombre AS CentroCosto,
pd.Concepto,
pd.Tipo,
SUM(pd.Monto) AS TotalMonto
FROM dbo.PlanillaDetalle pd
INNER JOIN dbo.Planillas p ON pd.PlanillaId = p.PlanillaId
INNER JOIN dbo.Empleados e ON pd.EmpleadoId = e.EmpleadoId
INNER JOIN dbo.CentrosCosto cc ON e.CentroCostoId = cc.CentroCostoId
WHERE p.Periodo = '2026-09'
GROUP BY
p.Periodo,
cc.Nombre,
pd.Concepto,
pd.Tipo
ORDER BY
cc.Nombre ASC,
pd.Tipo DESC,
TotalMonto DESC;

### Consulta B: Validación de cuadre contable (Débitos = Créditos) por planilla

SELECT
p.PlanillaId,
p.Periodo,
p.Estado,
ISNULL(SUM(CASE WHEN pd.Tipo = 'D' THEN pd.Monto ELSE 0 END), 0) AS TotalDebitos,
ISNULL(SUM(CASE WHEN pd.Tipo = 'C' THEN pd.Monto ELSE 0 END), 0) AS TotalCreditos,
(ISNULL(SUM(CASE WHEN pd.Tipo = 'D' THEN pd.Monto ELSE 0 END), 0) -
ISNULL(SUM(CASE WHEN pd.Tipo = 'C' THEN pd.Monto ELSE 0 END), 0)) AS Diferencia,
CASE
WHEN ISNULL(SUM(CASE WHEN pd.Tipo = 'D' THEN pd.Monto ELSE 0 END), 0) =
ISNULL(SUM(CASE WHEN pd.Tipo = 'C' THEN pd.Monto ELSE 0 END), 0)
THEN 'CUADRADO'
ELSE 'DESCUADRADO'
END AS EstadoContable
FROM dbo.Planillas p
LEFT JOIN dbo.PlanillaDetalle pd ON p.PlanillaId = pd.PlanillaId
GROUP BY
p.PlanillaId,
p.Periodo,
p.Estado;

---

## 🔍 Parte 4: Diagnóstico de Incidente en Producción

**Reporte del usuario:**  
"La planilla de septiembre aparece como 'Enviada a SAP' pero contabilidad no la ve en SAP."

### 1. ¿Qué preguntas haría al usuario?

1. ¿Cuál es el ID o número de documento exacto de la planilla y en qué sociedad/empresa de SAP la están buscando?
2. ¿Bajo qué pantalla o transacción de SAP están realizando la búsqueda (ej. Asientos Contables / Journal Entry) y con qué filtros de fecha?
3. ¿Revisaron si el registro ingresó como documento preliminar o borrador (Draft) en lugar de asiento definitivo?
4. ¿El usuario con el que consultan tiene restricciones de permisos por centro de costo o serie contable?

### 2. ¿Qué revisaría y en qué orden?

1. **Frontend:** Inspeccionar en la consola y pestaña Red (Network) el código HTTP retornado (200, 500, etc.) y el payload devuelto por /api/planillas/:id/enviar-sap.
2. **Backend:** Revisar logs del servidor en busca de excepciones, timeouts hacia la API de SAP o capturas de error silenciosas.
3. **Prisma / SQL Server:** Verificar directamente en base de datos el valor de Estado y validar si se guardó el identificador de confirmación (DocEntry / DocNum).
4. **SAP (Service Layer):** Consultar los logs de auditoría de SAP Service Layer para verificar si la petición fue recibida, si falló la autenticación (B1SESSION) o si fue rechazada por reglas de negocio contables.

### 3. Tres posibles causas raíz

1. **Falta de atomicidad en el backend:** El sistema actualizó el estado a 'EnviadaSAP' antes de validar la confirmación exitosa de SAP, o capturó un timeout de red y no revirtió el estado.
2. **Rechazo contable o guardado como borrador en SAP:** El documento fue rechazado por tener el periodo contable cerrado en SAP o quedó almacenado en la tabla de borradores (ODRF) en lugar de los asientos definitivos.
3. **Expiración de credenciales (B1SESSION):** La sesión del Service Layer de SAP expiró al momento del envío, generando un error 401 no gestionado adecuadamente.

### 4. Documentación del incidente (Post-Mortem)

- **Problema:** La planilla del periodo 2026-09 aparece con estado 'EnviadaSAP' en el sistema interno, pero el departamento contable no visualiza el asiento en SAP.
- **Causa Raíz:** La petición HTTP hacia SAP Service Layer sufrió un timeout tras 30 segundos. Por un manejo inadecuado del flujo, el backend dio por exitosa la operación y actualizó el estado en base de datos sin haber obtenido un DocEntry válido de confirmación.
- **Solución Implementada:**
  - _Inmediata:_ Reenvío manual del registro a SAP y confirmación del asiento generado.
  - _Correctiva:_ Refactorización del servicio backend para que el cambio de estado a 'EnviadaSAP' solo ocurra de forma transaccional una vez recibida una respuesta HTTP exitosa (201 Created) con identificador de SAP.
  - _Preventiva:_ Implementación de logs de trazabilidad con el ID de transacción de SAP y alertas ante fallos de sincronización.
