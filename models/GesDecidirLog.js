class GesDecidirLog {
    constructor(args) {
        this.gesDecidirLogId = args.gesDecidirLogId;
        this.fechaCreacion = args.fechaCreacion;
        this.fechaActualizacion = args.fechaActualizacion;
        this.idMedioPago = args.idMedioPago;
        this.bin = args.bin;
        this.monto = args.monto;
        this.cantCuotas = args.cantCuotas;
        this.interes = args.interes;
        this.montoConInteres = args.montoConInteres;
        this.montoPorCuota = args.montoPorCuota;
        this.status = args.status;
        this.error = args.error;
        this.nroTran = args.nroTran;
        this.appOrigen = args.appOrigen;
    }
    //? metodo devolver un objeto con los datos del modelo
    toJSON() {
        return {
            gesDecidirLogId: this.gesDecidirLogId,
            fechaCreacion: this.fechaCreacion,
            fechaActualizacion: this.fechaActualizacion,
            idMedioPago: this.idMedioPago,
            bin: this.bin,
            monto: this.monto,
            cantCuotas: this.cantCuotas,
            interes: this.interes,
            montoConInteres: this.montoConInteres,
            montoPorCuota: this.montoPorCuota,
            status: this.status,
            error: this.error,
            nroTran: this.nroTran,
            appOrigen: this.appOrigen
        }
    }   //? metodo devolver un objeto con los datos del modelo
    //? metodo editar un objeto con los datos del modelo
    edit(args) {
        this.fechaActualizacion = new Date();
        this.idMedioPago = args.idMedioPago;
        this.bin = args.bin;
        this.monto = args.monto;
        this.cantCuotas = args.cantCuotas;
        this.interes = args.interes;
        this.montoConInteres = args.montoConInteres;
        this.montoPorCuota = args.montoPorCuota;
        this.status = args.status;
        this.error = args.error;
        this.nroTran = args.nroTran;
        this.appOrigen = args.appOrigen;
    }
    //? metodo save guardar un objeto con los datos del modelo
    
}
module.exports = { GesDecidirLog };