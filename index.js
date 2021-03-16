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
    console.log("getProvinceDepartments")

    return new Promise((resolve, reject) => {
        console.log("promise adentro getProvinceDepartments")

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

const centroidCorrector = (provinceData, idProvince) => {
    console.log("centroidCorrector")

    const cabecera = 'CABECERA_DEPARTAMENTO'
    const partidos = provinceData.departamentos
    const partidosCorregidos = provinceData
    const url = `./leer/${idProvince}.json`
    if(idProvince != '02'){
        console.log("centroidCorrector if")

        fs.readFile(url, (err, data) => {
            console.log("centroidCorrector if readfile")

            if (err) throw err;
            let parsedData = JSON.parse(data);
            const localidades = parsedData.localidades_censales

            for (let i = 0; i < partidos.length; i++) {
                console.log("centroidCorrector if readfile bucle for")

                const cabeceraDepartamento = localidades.find(localidad => localidad.departamento.id === partidos[i].id && localidad.funcion === cabecera)
                //console.log('\n')
                //console.log(`PROVINCIA ${idProvince} Y DEPARTAMENTO ${partidos[i].id} `)
                //console.log({cabeceraDepartamento})
                if(cabeceraDepartamento==undefined){
                    //console.log(`NO HAY CABECERA DEPARTAMENTO `)
                }
                //console.log('ANTES',partidosCorregidos.departamentos[i].centroide)
                partidosCorregidos.departamentos[i].centroide = cabeceraDepartamento.centroide
                //console.log('DESPUES',partidosCorregidos.departamentos[i].centroide)

                
            }
        });
    }
    console.log("centroidCorrector if readfile despues del for")


    return partidosCorregidos
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
console.log("Afuera del for")
for (let i = 0; i < listadoProvincias.length; i++) {
    console.log("Adentro del for")

    const idProvince = listadoProvincias[i].id
    const provinceName = removeAccents(camelize(listadoProvincias[i].nombre))
    getProvinceDepartments(idProvince).then((provinceData) => {
        console.log("Adentro del primer then getProvinceDeparments")

        const correctedData = centroidCorrector(provinceData, idProvince)
        console.log("final \n")        

        fs.writeFile(`./extraerAqui/${idProvince}.json`, JSON.stringify(correctedData), (err) => {
            if (err) {
                console.error(err)
            } else {
                console.log(`File '${idProvince}.json' successfully written!`)
            }
        })
        }
    ).catch(err => console.error(err))
}
