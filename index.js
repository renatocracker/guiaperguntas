const express = require("express");
const app = express();
const bodyParser = require("body-parser"); //BODYPARSER
const connection = require('./database/database');
const Pergunta = require('./database/pergunta');
const Resposta = require('./database/Resposta');

//database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados.")
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })

// dizendo para o express usar o ejs como rendereizador
app.set('view engine','ejs'); 

//pasta com arquivos estaticos Exemplo CSS
app.use(express.static('public'));  

//BODYPARSER
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());                       

//ROTAS
app.get("/",(req, res)=>{
    Pergunta.findAll({raw: true, order:[
        ['id','DESC']
    ]}).then(perguntas => {
        res.render("index", {
            perguntas: perguntas
        })
    })
});

app.get("/perguntar",(req, res)=>{
    res.render("perguntar");
});

app.post("/salvarpergunta",(req, res) => {
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;

    Pergunta.create({   // create (metodo para salvar no db) 
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/")
    });
});


app.get("/pergunta/:id",(req, res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if(pergunta != undefined) {

            Resposta.findAll({
                where: {perguntaid: pergunta.id},
                order: [['id', 'DESC']]
            }).then(respostas => {
                res.render("pergunta",{
                    pergunta: pergunta,
                    resposta: respostas
                })
            })  
        }else{
            res.redirect("/")
        }
    })
});

app.post("/responder",(req, res) => {
    var corpo = req.body.corpo;
    var perguntaid = req.body.idpergunta

    console.log(perguntaid);

    Resposta.create({
        corpo: corpo,
        perguntaid: perguntaid
    }).then(() => {
        res.redirect("/pergunta/"+perguntaid);
    })
})

app.listen(8080,()=>{
    console.log("APP RODANDO");
});