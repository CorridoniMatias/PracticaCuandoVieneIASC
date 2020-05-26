const express = require('express');
const { colectivoMasCercano } = require('../ubicacion');
const { getWithPromise } = require('../request');
const { healthCheck } = require('../middleware.js');
const { SERVICIOS } = require('../config');

const TRANSITO = SERVICIOS.cuandoViene;

const app = new express();

app.use(healthCheck);

app.get('/cuando-viene/:parada', (req, res) => {
    const parada = req.params.parada;

    // Queremos obtener, para cada linea de la parada, el próximo colectivo que va a llegar
    getWithPromise(SERVICIOS.paradas, "/paradas/" + parada)
    .then(dataParada => {
        //{"ubicacion":110,"lineas":[15,60,720]}
        const promises = dataParada.lineas.map(linea => getWithPromise(SERVICIOS.lineas, "/lineas/" + linea));

        Promise.allSettled(promises)
        .then(httpPromises => {

            const lineasQueAndan = httpPromises.filter(httpResponse => httpResponse.status == "fulfilled" && httpResponse.value.funciona);
           
            const bondisCercanos = lineasQueAndan.map( linea => colectivoMasCercano(linea.value, dataParada.ubicacion) );
            
            res.json(bondisCercanos)
        })

    })
    .catch(error => {
        console.log(error);
        res.status(500).send();
    })

});

app.listen(TRANSITO.puerto, () => {
    console.log(`[${TRANSITO.nombre}] escuchando en el puerto ${TRANSITO.puerto}`);
});

