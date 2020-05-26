const http = require('http');

/**
 * Alguien nos dejó esta implementación de un GET en node.
 * ¡No cambiar interfaz!
 */
function get(servicio, ruta, cb) {
    const opciones = {
        hostname: servicio.host,
        port: servicio.puerto,
        path: ruta,
        method: 'GET',
    };

    const req = http.request(opciones, res => {
        if (res.statusCode !== 200) {
            return cb(new Error(`Request a ${servicio.nombre}${ruta} respondió ${res.statusCode}`));
        }
        let body = '';
        res
            .on('data', chunk => {
                body += chunk;
            })
            .on('end', () => {
                try {
                    cb(null, JSON.parse(body));
                } catch (e) {
                    cb(e);
                }
            });
    });
    req.on('error', error => {
        cb(error);
    });
    req.end();
}

const TIMEOUT = 6000;

const sleep = (timeout, servicio, ruta) => new Promise((_, reject) => setTimeout( () => reject(`Timeout ${servicio.nombre}${ruta}`) ,timeout));

const getWithPromise = (servicio, ruta) => {

    return Promise.race([ new Promise((resolve, reject) => {

        get(servicio, ruta, (error, data) => {
            if(error)
                return reject(error);

            resolve(data);
        })

    }), sleep(TIMEOUT, servicio, ruta) ]);
}

module.exports = {
    get,
    getWithPromise
};
