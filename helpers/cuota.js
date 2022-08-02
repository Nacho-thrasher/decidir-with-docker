
const calcularMontoConInteres = (monto, interes) => {
    if (monto == null || interes == null) return 0.0;
    const i = interes / 100;
    const montoConInteres = monto * (1 + i);
    return montoConInteres;
}
//? quitarle el interes al monto
const calcularMontoSinInteres = (monto, interes) => {
    if (monto == null || interes == null) return 0.0;
    const i = interes / 100;
    const montoSinInteres = monto / (1 + i);
    return montoSinInteres;
}
const calcularMontoPorCuota = (monto, cantidad, interes) => {
    if (monto == null || cantidad == null || cantidad <= 0 || interes == null) 
    return 0.0;
    const montoConInteres = calcularMontoConInteres(monto, interes);
    const montoPorCuota = montoConInteres / cantidad;
    return montoPorCuota;
}
const calcularMontoPorCuotaSinInteres = (monto, cantidad, interes) => {
    if (monto == null || cantidad == null || cantidad <= 0 || interes == null) 
    return 0.0;
    const montoSinInteres = calcularMontoSinInteres(monto, interes);
    const montoPorCuota = montoSinInteres / cantidad;
    return montoPorCuota;
}

module.exports = { calcularMontoConInteres, calcularMontoPorCuota, calcularMontoSinInteres, calcularMontoPorCuotaSinInteres };