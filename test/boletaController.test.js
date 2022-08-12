// const require = require('express').Router();
// const superTest = require('supertest');
// const request = superTest('http://localhost:8880/v1');

process.env.DB_USUARIO = 'APP_GESTION'
process.env.DB_CLAVE = 'APP_GESTION'
process.env.DB_URL_CONEXION = 'odevdb.ucasal.edu.ar:1521/oratest'
process.env.DECIDIR_URL = 'https://developers.decidir.com/api/v2/'
process.env.DECIDIR_PUBLIC_KEY = '96e7f0d36a0648fb9a8dcb50ac06d260'
process.env.DECIDIR_PRIVATE_KEY = '1b19bb47507c4a259ca22c12f78e881f'
process.env.APP_ENTORNO = 'testing'
// process.env.APP_PUERTO = 8080

// const { getBoletaById } = require('../services/boleta');

//     // beforeAll(async () => {
//     //     await conectarse();
//     // })
//     //? test para obtener boleta por id
//     // it('should return a boleta', async () => {
//     //     const boleta = await getBoletaById(12551797);
//     //     console.log(boleta);
//     //     //? expect true to be true
//     // }).timeout(1000) //? timeout para que no se quede en espera infinita
    
//     //? test para obtener boleta por id con error
//     // it('should return a boleta', async () => {
//     //     const boleta = await getBoletaById(7192653);
//     //     console.log(boleta);
//     //     expect(boleta).toEqual(null);
//     //     //? expect true to be tru
//     // })
// })
const { getAmount, getAllAmounts} = require('../helpers/amount');
const movim = {
    montoPendiente: 5000,
    TOTAL2: 18000,
    FVTO1: new Date(2020, 1, 1),
    TOTAL1: 18000,
}
//? test para obtener monto
it('movim -> float amount', () => {
    const amount = getAmount(movim, null, null);
    console.log(amount);
    expect(amount).toEqual(18000);
})
it('monto -> float amount', () => {
    const amount = getAmount(movim, 5000, null);
    console.log(amount);
    expect(amount).toEqual(5000);
})
it('amounts -> getAllAmounts', () => {
    const amounts = getAllAmounts({total: 15000, monto: 5000}, 0, 12);
    console.log(amounts);
    expect(amounts.longAmount).toEqual('500000');
    expect(amounts.montoConInteres).toEqual(5000);
    expect(amounts.montoPorCuota).toEqual(5000 / 12);    
})
//? primero conectar a la base de datos y despues ejecutar los tests
const supertest = require('supertest') 
// const app = require('../index') 
// const api = supertest(app) 
console.clear()

const { conectarse, consulta } = require('../vendor/transaction');

// const { consulta } = jest.requireActual('../index');
// const conectarse = (...args) => import('../index').then(({default: conectarse}) => conectarse(...args));
// const consulta = (...args) => import('../index').then(({default: consulta}) => consulta(...args));
beforeAll(async () => {
    conectarse();
})
//? traer select de prueba 
it('should return a connection', async () => {
    const result = await consulta('SELECT * FROM TBL_DEC_PROVEEDOR_PAGOS WHERE HABILITADO = 1');
    console.log(result);
    expect(result).toEqual(null);
})  
// ? boleta
// jest.mock('../services/boleta');
const { getBoletaById } = jest.requireActual('../services/boleta');	
// const { getByNroTran } = jest.requireActual('../services/movimiento');

it('should return a boleta', async() => {
    const boleta = await getBoletaById(43139385);
    console.log('boleta',boleta);
    expect(boleta).toEqual(null);
})