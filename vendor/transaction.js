const crypto = require('crypto'); //<-- para generar las UUIDs cuando a consulta() le pasan la option.discard_unkeyed = false (default: true)
const conColor = require('../console_colors');
const oracledb = require('oracledb');

let conexion;
let pool = {}; //<-- en este caso es un JSON porque en éste endpoint tendremos que usar dos usuarios APP_GESTION y APP_AFIP... -.-  ... yaaaass... I don't make the rules :( 
const mostrar_errores = (process.env.APP_MOSTRAR_ERRORES == 'true') || false;

const conectarse = (entorno, mostrar_errores) => {
    try {
        let connectString;
        let iPool = 0;
        let arUsuarios = process.env.DB_USUARIO.split(',');
        let arClaves = process.env.DB_CLAVE.split(',');
        
        if (arUsuarios.length != arClaves.length){
            divisor("#",2);
            console.log(conColor.Red,'############ NO COINCIDEN LA CANTIDAD DE USUARIOS CON LA CANTIDAD DE CLAVES ########### ',conColor.White);
            divisor("#",2);
            return false;
        };
        if (process.env.DB_URL_CONEXION){
            connectString = process.env.DB_URL_CONEXION;
        }else{
            if (entorno == 'produccion'){
                connectString = 'oraprod.ucasal.edu.ar:1521/oratest';
            }else if(entorno == 'testing'){
                connectString = 'odevdb.ucasal.edu.ar:1521/oratest';
            }else{
                connectString = 'odevdb.ucasal.edu.ar:1521/oratest';
            };
        };

        console.log('\n\n\n\n\n\n Creando pool de conexiones en: ------> ',conColor.Cyan,connectString,conColor.White);
        arUsuarios.forEach((usuario)=>{
            clave = arClaves.shift();
            pool[usuario] = oracledb.createPool({
                user: usuario,
                password: clave,
                connectString : connectString,
                poolMin: parseInt(process.env.DB_POOL_MIN || 1),
                poolMax: parseInt(process.env.DB_POOL_MAX || 10),
                poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || 1),
                poolTimeout: 60
            }).then(p=>pool[usuario] = p)
            
            //la primera conexión es la conexión .default ya que la función consulta() si no le pasan parámetro de qué pool usar, usa el indicado por pool.default
            if (!pool?.default){
                pool.default = usuario;
            };

            iPool++;
            console.log(conColor.White,`POOL ${iPool}/${arUsuarios.length} CONECTADO COMO ---------> `,conColor.Green, usuario,conColor.Yellow,(iPool == 1?' (default)':''),conColor.White);
            
        });
        console.log(conColor.White,'ERRORES ---------> ',(mostrar_errores?conColor.Green:conColor.Red), (mostrar_errores?"MOSTRADOS":"OCULTOS"),conColor.White);
        console.log(conColor.White,'ENTORNO ---------> ',(entorno=='produccion'?conColor.Red:conColor.Green), entorno,' \n\n\n\n\n\n',conColor.White);
        //? retornar el pool de conexiones
        return pool;
    
    } catch (err) {
        console.log(conColor.Red,'ERROR AL CREAR EL POOL',conColor.White,' ---------> \n');
        console.log(conColor.Red,err,'\n\n\n',conColor.White);
    }
};
async function consulta(query,options = {}){
    let salida = [];
    let error = false;
    
    //por las porsias ponemos el valor por defecto del options.discard_unkeyed = true (esto implica que cualquier row que no tenga la propiedad key será ignorado)
    if (!options.hasOwnProperty('discard_unkeyed')){
        options.discard_unkeyed = true;
    };
    if (options?.pool){
        conexion = await pool[options.pool].getConnection();
    }else{
        conexion = await pool[pool.default].getConnection();        
        console.warn(conColor.Yellow,`--- usando pool por defecto (${pool.default}) --- `,conColor.White);
    };
    try {
        result = await conexion.execute(
            query,
            [],
            { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const rs = result.resultSet;
        if(rs){
            let row;
            if (!options.hasOwnProperty('key')){
                //si no especifica key entro por aqui para no andar haciendo que pase por el if al vicio
                while ((row = await rs.getRow())) {
                    salida.push(row);
                };//<-- del while
                await rs.close();
            }else{
                let key = options.key;
                let key_ya_existe;
                let tiene_key;
                salida = {};
                
                while ((row = await rs.getRow())) {
                    tiene_key = row[key] || false;
                    if (tiene_key){
                        key_ya_existe = salida[row[key]] || false;
                        if (!key_ya_existe){
                            salida[row[key]]=[];
                        };
                        salida[row[key]].push(row);
                    }else{
                        //me fijo si es que tengo que descartar o asignarle un uuid a los rows que no tienen el key esperado
                        if (!options.discard_unkeyed){
                            salida[crypto.randomUUID()] = {row};
                        };
                    };
                };//<-- del while
                await rs.close();
            };
            //await rs.close();
        }
    } catch (err) {
        let divisor = '\n\n-----------------------------------------------------------------------\n\n';
        error = {error:true,code:err,message:err?.message,errorTraceId:crypto.randomUUID()};
        console.error(conColor.Red, error);
        console.log(divisor+' QUERY:\n',query,divisor,conColor.White);
        if (!mostrar_errores){error=[]};
    };
    await conexion.close({drop: true});
    return !error?salida:error;
}; //<-- de la function consulta

module.exports = { conectarse, consulta };