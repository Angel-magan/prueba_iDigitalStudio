IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NominaContabilidadDB')
BEGIN
    CREATE DATABASE NominaContabilidadDB;
END
GO

USE NominaContabilidadDB;
GO

-- 1. Tablas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CentrosCosto')
BEGIN
    CREATE TABLE CentrosCosto (
        CentroCostoId INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Empleados')
BEGIN
    CREATE TABLE Empleados (
        EmpleadoId INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        CentroCostoId INT NOT NULL FOREIGN KEY REFERENCES CentrosCosto(CentroCostoId),
        Activo BIT NOT NULL DEFAULT 1
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Planillas')
BEGIN
    CREATE TABLE Planillas (
        PlanillaId INT IDENTITY(1,1) PRIMARY KEY,
        Periodo VARCHAR(7) NOT NULL,
        Estado VARCHAR(20) NOT NULL CHECK (Estado IN ('Borrador', 'Aprobada', 'EnviadaSAP'))
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PlanillaDetalle')
BEGIN
    CREATE TABLE PlanillaDetalle (
        DetalleId INT IDENTITY(1,1) PRIMARY KEY,
        PlanillaId INT NOT NULL FOREIGN KEY REFERENCES Planillas(PlanillaId),
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES Empleados(EmpleadoId),
        Concepto NVARCHAR(100) NOT NULL,
        Monto DECIMAL(12,2) NOT NULL,
        Tipo CHAR(1) NOT NULL CHECK (Tipo IN ('D', 'C'))
    );
END
GO

-- 2. Datos Semilla
IF NOT EXISTS (SELECT 1 FROM CentrosCosto)
BEGIN
    SET IDENTITY_INSERT CentrosCosto ON;
    INSERT INTO CentrosCosto (CentroCostoId, Nombre) VALUES 
    (1, 'Tecnología'),
    (2, 'Operaciones'),
    (3, 'Recursos Humanos');
    SET IDENTITY_INSERT CentrosCosto OFF;
END
GO

IF NOT EXISTS (SELECT 1 FROM Empleados)
BEGIN
    SET IDENTITY_INSERT Empleados ON;
    INSERT INTO Empleados (EmpleadoId, Nombre, CentroCostoId, Activo) VALUES 
    (1, 'Carlos Mendoza', 1, 1),
    (2, 'María Elena Ramos', 2, 1),
    (3, 'Fernando Morales', 1, 1),
    (4, 'Andrea Guillén', 3, 1);
    SET IDENTITY_INSERT Empleados OFF;
END
GO

IF NOT EXISTS (SELECT 1 FROM Planillas WHERE PlanillaId = 101)
BEGIN
    SET IDENTITY_INSERT Planillas ON;
    INSERT INTO Planillas (PlanillaId, Periodo, Estado) VALUES 
    (101, '2026-09', 'Aprobada');
    SET IDENTITY_INSERT Planillas OFF;
END
GO

IF NOT EXISTS (SELECT 1 FROM PlanillaDetalle WHERE PlanillaId = 101)
BEGIN
    INSERT INTO PlanillaDetalle (PlanillaId, EmpleadoId, Concepto, Monto, Tipo) VALUES 
    -- Carlos Mendoza
    (101, 1, 'Salario Base Quincenal', 1250.00, 'D'),
    (101, 1, 'Retención de Renta', 125.00, 'C'),
    (101, 1, 'Pago Neto en Banco', 1125.00, 'C'),
    -- María Elena Ramos
    (101, 2, 'Salario Base Quincenal', 850.00, 'D'),
    (101, 2, 'Retención de Renta', 85.00, 'C'),
    (101, 2, 'Pago Neto en Banco', 765.00, 'C'),
    -- Fernando Morales
    (101, 3, 'Salario Base Quincenal', 1500.00, 'D'),
    (101, 3, 'Retención de Renta', 150.00, 'C'),
    (101, 3, 'Pago Neto en Banco', 1350.00, 'C'),
    -- Andrea Guillén
    (101, 4, 'Salario Base Quincenal', 1100.00, 'D'),
    (101, 4, 'Retención de Renta', 110.00, 'C'),
    (101, 4, 'Pago Neto en Banco', 990.00, 'C');
END
GO

-- 3. Procedimiento Almacenado: usp_AprobarPlanilla
IF OBJECT_ID('dbo.usp_AprobarPlanilla', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_AprobarPlanilla;
GO

CREATE PROCEDURE dbo.usp_AprobarPlanilla
    @PlanillaId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validar que la planilla exista y esté en estado 'Borrador'
        DECLARE @EstadoActual VARCHAR(20);

        SELECT @EstadoActual = Estado
        FROM dbo.Planillas WITH (UPDLOCK, HOLDLOCK)
        WHERE PlanillaId = @PlanillaId;

        IF @EstadoActual IS NULL
        BEGIN
            THROW 50001, 'La planilla especificada no existe.', 1;
        END

        IF @EstadoActual <> 'Borrador'
        BEGIN
            THROW 50002, 'La planilla no se encuentra en estado Borrador para ser aprobada.', 1;
        END

        -- 2. Validar cuadre contable (Débitos = Créditos)
        DECLARE @TotalDebitos DECIMAL(12,2) = 0;
        DECLARE @TotalCreditos DECIMAL(12,2) = 0;

        SELECT 
            @TotalDebitos = ISNULL(SUM(CASE WHEN Tipo = 'D' THEN Monto ELSE 0 END), 0),
            @TotalCreditos = ISNULL(SUM(CASE WHEN Tipo = 'C' THEN Monto ELSE 0 END), 0)
        FROM dbo.PlanillaDetalle
        WHERE PlanillaId = @PlanillaId;

        IF (@TotalDebitos = 0 AND @TotalCreditos = 0)
        BEGIN
            THROW 50003, 'La planilla no contiene movimientos contables registrados.', 1;
        END

        IF (@TotalDebitos <> @TotalCreditos)
        BEGIN
            THROW 50004, 'La planilla presenta descuadre contable (Débitos <> Créditos). No puede ser aprobada.', 1;
        END

        -- 3. Transicionar estado a 'Aprobada'
        UPDATE dbo.Planillas
        SET Estado = 'Aprobada'
        WHERE PlanillaId = @PlanillaId;

        COMMIT TRANSACTION;

        SELECT 
            @PlanillaId AS PlanillaId,
            'Aprobada' AS NuevoEstado,
            @TotalDebitos AS TotalBalanceado,
            'Planilla aprobada exitosamente.' AS Mensaje;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END;
GO