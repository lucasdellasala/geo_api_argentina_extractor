const fetch = require('node-fetch');
const fs = require('fs')
const fsp = require('fs').promises

const data = require('./provincias.json')
const listadoProvincias = data.provincias

console.table(listadoProvincias)

const idsProvincias = listadoProvincias.map(e=>e.id)

idsProvincias.map(e=>{
    if (e!="02"){
        fs.readFile(`./extraerAqui/${e}.json`,'utf8', (err, data)=>{
            if (err) throw (err)
            
            const provinciaData = JSON.parse(data)
            const departamentos = provinciaData.departamentos
            let departamentosFinales = []


            departamentos.map((departamento, index) => {
                const idDepartamento = departamento.id
                
                fsp.readFile(`./leer/${e}.json`,'utf8')
                .then((data)=>{
                    const localidades = JSON.parse(data).localidades_censales
    
                    const cabecera = localidades.find(
                        localidad => 
                        localidad.funcion == 'CABECERA_DEPARTAMENTO' 
                        && localidad.departamento.id == idDepartamento
                    )
                    
                    const cabeceraCapital = localidades.find(
                        localidad => 
                        localidad.funcion == 'CAPITAL_PROVINCIA' 
                        && localidad.departamento.id == idDepartamento
                    )
                    
                    if(cabecera != undefined && cabeceraCapital == undefined){
                        /*if(idDepartamento == "54028"){
                            console.log(provinciaData.departamentos[index].centroide)
                        }*/
                        departamentosFinales.push({
                            "centroide": cabecera.centroide,
                            "id": cabecera.departamento.id,
                            "nombre": cabecera.departamento.nombre
                        })
                        //if (e=="94")console.log("CABECERA", departamentosFinales.length)

                        //provinciaData.departamentos[index].centroide = cabecera.centroide
                        /*if(idDepartamento == "54028"){
                            console.log(provinciaData.departamentos[index].centroide, '\n')
                        }*/
                        //console.log(cabecera.funcion, cabecera.provincia.nombre, '\n')
                    }  else if (cabecera == undefined && cabeceraCapital != undefined) {
                        /*if(idDepartamento == "54028"){
                            console.log(provinciaData.departamentos[index].centroide)
                        }*/
                        //if(e=="54") console.log(cabeceraCapital)
                        departamentosFinales.push({
                            "centroide": cabeceraCapital.centroide,
                            "id": cabeceraCapital.departamento.id,
                            "nombre": cabeceraCapital.departamento.nombre
                        })                   
                        //if (e=="94")console.log("CAPITAL", departamentosFinales.length)
                        if(idDepartamento == "54028"){
                            //console.log({cabeceraCapital})
                            //console.log({departamentosFinales})
                        }
                        //provinciaData.departamentos[index].centroide = cabeceraCapital.centroide
                        /*if(idDepartamento == "54028"){
                            console.log(provinciaData.departamentos[index].centroide)
                        }*/  
                    }  else {
                        //Cuando tanto cabecera como cabeceraCapital son undefined
                        departamentosFinales.push(provinciaData.departamentos[index])
                        //console.log(provinciaData.departamentos[index])
                        //console.log(`CABECERA CAPITAL -> PROVINCIA ${e} - DEPARTAMENTO ID ${idDepartamento} - UNDEFINED`)
                    }
                    return departamentosFinales
                })
                .then((data)=>{
                    fs.writeFile(`./final/${e}.json`, JSON.stringify({"departamentos": data, "cantidad": data.length}), (err) => {
                        if (err) {
                            console.error(err)
                        } else {
                            console.log(`File '${e}.json' successfully written!`)
                        }
                    })
                })
            })
            //console.time()
            //console.log(departamentosFinales)
            //TODO: poner timestamp

            
            
        })       
    }
})


//console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ \n",listadoCabeceras, '\n')
//console.log("CANTIDAD CABECERAS", listadoCabeceras.length)


/*const getProvinceDepartments = (idProvince) => {
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
}*/
