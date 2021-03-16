const fs = require('fs')
const fetch = require('node-fetch');

const url = "https://apis.datos.gob.ar/georef/api/asentamientos?provincia=2&campos=centroide,departamento,nombre&max=200"

const getBarrios = () => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const correctedData = dataCorrector(data)
                resolve(correctedData)
            })
            .catch(err => reject(err))
    })
}

const dataCorrector = (data) => {
    const barrios = data.asentamientos

    const barriosCorregidos = []
    barrios.map(barrio => {
        if (barrio.departamento.id != null) {
            barriosCorregidos.push(
                {
                    "centroide": barrio.centroide,
                    "id": barrio.id,
                    "nombre": barrio.nombre,
                    "comuna": barrio.departamento.nombre
                }

            )
        }
    })

    return barriosCorregidos
}


getBarrios().then(data => {
    fs.writeFile(`./CABA/02.json`, JSON.stringify({"departamentos": data, "cantidad": data.length}), (err) => {
        if (err) {
            console.error(err)
        } else {
            console.log(`File '02.json' successfully written!`)
        }
    })
})
