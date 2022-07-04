
const calcularMontoConInteres = (monto, interes) => {
    if (monto == null || interes == null) return 0.0;
    const i = interes / 100;
    const montoConInteres = monto * (1 + i);
    return montoConInteres;
}
const calcularMontoPorCuota = (monto, cantidad, interes) => {
    if (monto == null || cantidad == null || cantidad <= 0 || interes == null) 
    return 0.0;
    const montoConInteres = calcularMontoConInteres(monto, interes);
    const montoPorCuota = montoConInteres / cantidad;
    return montoPorCuota;
}

module.exports = { calcularMontoConInteres, calcularMontoPorCuota };