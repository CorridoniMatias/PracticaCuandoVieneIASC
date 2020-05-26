const express = require('express');
const fs = require('fs');
const { SERVICIOS } = require('../config');
const { healthCheck } = require('../middleware.js');
const { actualizarUbicaciones } = require('./actualizarUbicaciones');
const path = require("path");

const LINEAS = SERVICIOS.lineas;

const lineasDb = {
    buscarPorLinea(linea) {

        return new Promise((res, fa) => {
            fs.readFile(path.join(__dirname + "\\lineas.db.json"), "utf8", (err, data) => {
                
                if (err) {
                    fa(err);
                    return;
                }

                res(data);
            });

        }).then(data => {
            const json = JSON.parse(data);
            return Promise.resolve(json[linea]);        
        });
        
    }
};

const app = new express();

app.use(healthCheck);

app.get('/lineas/:linea', (req, res) => {
    const nroLinea = req.params.linea;
    const estadoLinea = lineasDb.buscarPorLinea(nroLinea);
    
    estadoLinea.then(linea => {

        if (linea === undefined) {
            res.sendStatus(404);
        } else {
            res.json({...linea, linea: +nroLinea});
        }
    });
});

app.listen(LINEAS.puerto, () => {
    console.log(`[${LINEAS.nombre}] escuchando en el puerto ${LINEAS.puerto}`);
    //actualizarUbicaciones();
});
