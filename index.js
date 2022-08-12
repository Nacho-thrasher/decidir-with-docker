//------ requires varios ------
const express = require('express');
const oracledb = require('oracledb');
const crypto = require('crypto'); //<-- para generar las UUIDs cuando a consulta() le pasan la option.discard_unkeyed = false (default: true)
//para mandar colorincherío en los consoles logs
const conColor = require('./console_colors.js');
require('dotenv').config()
const { conectarse } = require(`./vendor/transaction`)
// gilada para usar un caracter como patron para dividir la pantalla de salida en el console.log
const divisor = ((caracter = "#",repetir=1)=>{while(repetir--){console.log(caracter.repeat(process.stdout.columns))}});

//------ inicializamos el oracle instant client ------
try {
    console.log('\n');
    divisor("_",2);
    console.log('Inicializando el cliente oracle...');
    oracledb.initOracleClient();
} 
catch (err) {
    console.error(conColor.Red,'Error al iniciar el cliente de Oracle');
    console.error(err);
    process.exit(1);
}

// ------ instancio la app express ------
const app = express()
app.use(express.json())

//------ inicializaciones/configuraciones varias ------
const api_root = process.env.API_ROOT || '/v1'
const port = process.env.APP_PUERTO
const entorno = process.env.APP_ENTORNO || 'testing';
const mostrar_errores = (process.env.APP_MOSTRAR_ERRORES == 'true') || false;

let conexion;
let pool = {}; //<-- en este caso es un JSON porque en éste endpoint tendremos que usar dos usuarios APP_GESTION y APP_AFIP... -.-  ... yaaaass... I don't make the rules :( 
oracledb.autoCommit = true;
oracledb.errorUrl = true;
/**
* CORS
**/
app.use(function (req, res, next) {
    res.set({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'Authorization, Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT',
    });    
    /**
     * @todo application logs
     */
    //console.log(req.originalUrl, req.query, req.body);
    next();
});
//------ nos conectamos a la BD ------
/**
 * 
 * @todo npm o link a paquete
 */
//------ las rutas ------
//! ------ PARA EL HEALTHCHECK DEL DOCKER ------
app.get (`${api_root}/healthcheck_dd5fe42e6f60ac50e4139e75467fbeeecc26381e`, (req, res) => {
    res.status(200).json({health:"ok"});
})
//! ------ PARA OBTENER LA SPEC DE LA API ------
app.get (`${api_root}/spec.yaml`, (req, res) => {
    const fs = require("fs");    
    try {
        res.send(fs.readFileSync("./spec.yaml"));
    } catch (error) {
        res.send(`
            swagger: "2.0"
            info:
                description: "No hay definición de la API disponible, póngase en contacto con el área de sistemas"
                title: "Error"
                contact:
                    email: "sistemas@ucasal.edu.ar"
            basePath: "${api_root}"
        `);
    };
});

app.get (`${api_root}`, (req, res) => {
    res.send(`
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8"> 
            <script type="module" src="//unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
        </head>
        <body>
            <rapi-doc
                spec-url = "${api_root}/spec.yaml"
                theme = "dark"
                render-style = "read"
                allow-try="false"
                show-header = "false"
                allow-authentication="false"
            > 
            <script>
                if (document.location.href.split("#")[1] != "overview"){
                    document.location = "#overview";
                };
            </script>
            </rapi-doc>
        </body>
        </html>
    `);
})
//? ------ LAS RUTAS DE LA API EN CUESTIÓN ------
const route = require('./route');
app.use(`${api_root}`, route);

//! ################## ARRANCO LA APP ##################
app.listen(port, () => {
    //hacemos que se conecte
    conectarse(entorno, mostrar_errores)
    //mandamos log a la consola como para indicar que arrancamos bien
    console.log(conColor.White,`Escuchando en el puerto ------> `,conColor.Green,port,conColor.Yellow," (dentro de docker)",conColor.White)
    divisor("_",2);console.log('\n\n');    
})
