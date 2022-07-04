const { object }       = require('../helpers/objectToken');
const { DECIDIR_URL, DECIDIR_PUBLIC_KEY }  = process.env;
const urlDecidir       = `https://developers.decidir.com/api/v2/`
const publicKey        = `96e7f0d36a0648fb9a8dcb50ac06d260`
const axios = require('axios');

const createToken = async(req, res) => {
    try {
        let args = object(req.body);
        //? generar el token con axios con headers
        const response = await axios.post(`${urlDecidir}tokens`, args, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': publicKey,
                'Cache-Control': 'no-cache'
            }
        });
        res.json(response.data);

    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error al crear el token',
            error: error
        });
    }
}
module.exports = {
    createToken
}
