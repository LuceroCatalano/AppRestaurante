var express = require('express');
var	app = express();
const nunjucks = require('nunjucks');
const { PORT, HOST } = require('./config');
nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const config = require('./config')

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = HOST


app.all('/', (req, res)=>{
  MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {
    const dbo = db.db("menuResto");  
    dbo.collection("platos").find().sort({"plato":1}).toArray((err, platos) => {
      dbo.collection("categorias").find().sort({"categoria":1}).toArray((err, categorias) => {	     
        res.render('index.html',{platos:platos, categorias:categorias});
      });
    });
  });	
});

  app.all('/altacategoria', (req, res)=>{
    if(req.body.categoria) {
      MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
      const dbo = db.db("menuResto")
      const cat= req.body.categoria
      dbo.collection("categorias").insertOne(    
        {
            categoria: cat
          },       
          function (err) {
              db.close();
              if (err) {               
                if(err.code == 11000);
                {	      
                  res.render('altacategoria.html',{mensaje:`${req.body.categoria} ya existe en la base de datos`});
                }
              }
              else{
                res.render('altacategoria.html',{mensaje: `${req.body.categoria} se ha cargado exitosamente...`})
              }
          }
          )        
      })
    }
    else{
      res.render('altacategoria.html');      
    }
  });

  app.all('/altaplato', (req, res)=>{
    if(req.body.plato&&req.body.categoria&&req.body.descripcion&&req.body.imagen) {
      MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
      const dbo = db.db("menuResto")
      const fecha = new Date().getTime()
      dbo.collection("platos").insertOne(
          {
              id: fecha,
              plato: req.body.plato,
              categoria: req.body.categoria,
              descripcion: req.body.descripcion,
              imagen: req.body.imagen
          },
          function (err) {
            db.close();    
            if (err) {       
              if(err.code == 11000)
              MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
                const dbo = db.db("menuResto");    
                dbo.collection("categorias").find().toArray(function(err, categorias) {	      
                  res.render('altaplato.html',{categorias:categorias, mensaje:`${req.body.plato} ya existe en la base de datos`});
                });
              })                     
             }             
             else{
              MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
                const dbo = db.db("menuResto");    
                dbo.collection("categorias").find().toArray(function(err, categorias) {	      
                  res.render('altaplato.html',{categorias:categorias, mensaje:`${req.body.plato} se a agregado exitosamente`});
                });
              })  
             };
          }
        )         
      })
    }
    else{
      MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
        const dbo = db.db("menuResto");    
        dbo.collection("categorias").find().toArray(function(err, categorias) {	      
          res.render('altaplato.html',{categorias:categorias});
        });
      });        
    }
  })

  app.get('/plato/:plato', (req, res)=>{	  
    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
    const dbo = db.db("menuResto");
    dbo.collection("platos").findOne({"plato":req.params.plato}, function(err, plato) {
        if (err) throw err;
        else{
          res.render('plato.html',{plato:plato});
        }
        
        db.close();
        });
      });
  });	
  app.get('/categoria/:categoria', (req, res)=>{	  
    var busqueda = new RegExp(req.params.categoria,"i")
    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
    const dbo = db.db("menuResto");
    dbo.collection("platos").find({"categoria":busqueda}).toArray(function(err, platos)
    {
        if (err) throw err;
        else{
          res.render('categoria.html',{platos:platos,categoria:req.params.categoria});
        }
        
        db.close();
        });
      });
  });	

  app.listen(PORT);