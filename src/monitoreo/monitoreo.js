const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { getWithPromise } = require('../request');
const { SERVICIOS } = require('../config');

const MONITOREO = SERVICIOS.monitoreo;

const app = new express();

app.get('/', (res, req) => {
    req.sendFile('index.html', { root: __dirname });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function mensaje(contenido) {
    const esTexto = typeof contenido === 'string';
    return JSON.stringify({ msg: contenido, type: esTexto ? 'texto' : 'estados' });
}

wss.on('connection', (ws) => {
    ws.send(mensaje('¡Conectado al monitoreo de servicios!'));

    setInterval(() => {

        const servicios = Object.keys(SERVICIOS).filter( servicio => servicio != "monitoreo")
        
        const consultas = servicios.map( servicio => getWithPromise(SERVICIOS[servicio], "/health") );

        Promise.allSettled( consultas ).then( promises => {

            const estados = promises.map( (promise, i) => {
                if(promise.status == "rejected")
                {
                   return { servicio: servicios[i], status: "DOWN" };
                }
                else {
                    return { servicio: servicios[i], status: "UP" };
                }
            } )

            ws.send(mensaje({estados}));

        });

        ws.send(mensaje('Hey'));
    }, 1000);

    ws.on('close', () => {
        console.log('Se cerró una conexión');
    });
});

server.listen(MONITOREO.puerto, () => {
    console.log(`[${MONITOREO.nombre}] escuchando en el puerto ${MONITOREO.puerto}`);
});

