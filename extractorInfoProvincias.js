const fetch = require('node-fetch');
const fs = require('fs')
/*
Esta lista de provincias tiene editados los centroides: 
en lugar del centroide de la provincia dejé el centroide de la capital de la provincia.
Además modifiqué el nombre de Tierra del Fuego e hice algún que otro retoque para que sea más cómodo y útil.
*/
const data = require('./provincias.json')
const listadoProvincias = data.provincias

const getProvinceDepartments = (idProvince) => {
    return new Promise((resolve, reject) => {
        //CABA: "02"
        if (idProvince != "02") {
            fetch(`https://apis.datos.gob.ar/georef/api/departamentos?campos=id,nombre,centroide.lon,centroide.lat&provincia=${idProvince}&max=200`)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(err => reject(err))
        } else {
            //Esto lo hago para en lugar de poner las Comunas de CABA poner los barrios.
            fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${idProvince}&campos=id,nombre,centroide.lat,centroide.lon&max=150`)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(err => reject(err))
        }
    })
}

const camelize = (text) => {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

for (let i = 0; i < listadoProvincias.length; i++) {
    const idProvince = listadoProvincias[i].id
    const provinceName = removeAccents(camelize(listadoProvincias[i].nombre))
    getProvinceDepartments(idProvince).then(
        (provinceData) => {
            fs.writeFile(`./extraerAqui${provinceName}.json`, JSON.stringify(provinceData), (err) => {
                if (err) {
                    console.error(err)
                } else {
                    console.log(`File '${provinceName}.json' successfully written!`)
                }
            })
        }
    ).catch(err => console.error(err))
}