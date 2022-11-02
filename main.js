const express = require("express")
const fs = require("fs");

class Contenedor {
  constructor(archivoName) {
    this.archivoName = archivoName;
    this.id = 0;
  }

  aleatori() {
    if (this.id === 0) {
      this.id = 1;
    } else {
      let newId = Math.floor(Math.random() * (9999 - (this.id + 2)));
      this.id = newId;
    }
    return this.id;
  }

  async save(obj){
    try {
      if (fs.existsSync(this.archivoName)) {
        let data = await this.getAll();
        let prd = await JSON.parse(data);
        await (this.id = prd[prd.length - 1].id);
        await prd.push({ id: this.aleatori(), ...obj });
        await fs.promises.writeFile(this.archivoName, JSON.stringify(prd));
      } else {
        await fs.promises.writeFile(
          this.archivoName,
          JSON.stringify([{ id: this.aleatori(), ...obj }])
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  async getById(numId){
    let data = await this.getAll();
    let array = await JSON.parse(data);
    let con = 0;
    for await (let i of array) {
      if (i.id === numId) {
        return i;
      }
      con++;
      if (con === array.length) {
        return null;
      }
    }
  };

  async getAll(){
    let dates = await fs.promises.readFile(this.archivoName, "utf-8");
    return dates;
  };

  async getDeleteById(numId){
    try {
      const newArray = [];
      let data = await this.getAll();
      let array = await JSON.parse(data);
      let con = 0;
      for await (let i of array) {
        if (i.id === numId) {
          newArray.push(i);
        }
        con++;
        if (con === array.length) {
          await fs.promises.writeFile(
            this.archivoName,
            JSON.stringify(newArray)
          );
        }
      }
    } catch (error) {
      console.log("Error en DeleteByID");
    }
  };
  async deleteAll(){
    try {
      await fs.promises.writeFile("[]");
    } catch (error) {
      console.log(
        "Hubo un error a la hora de eliminar los elementos del array"
      );
    }
  };
}

const app = express()
const PORT = 8080
const server = app.listen(PORT, ()=>{
  console.log(`Servidor levantado con exito en puerto ${server.address().port}`)
})
server.on("error", error=>{
  console.log(`Al parecer ocurrio un error al intentar levantar el servidor${error}`)
})

const archivo = new Contenedor("productos.txt");

app.get("/productos", async (req,res)=>{
  const array = await archivo.getAll()
  res.send(array)
})

app.get("/productoRandom", async(req, res)=>{
  const array = await archivo.getAll()
  const newArray = JSON.parse(array)
  const numRand = Math.floor(Math.random() * (newArray.length - 1))
  const rta = JSON.stringify(newArray[numRand], null, 2)
  res.send(rta)
})

