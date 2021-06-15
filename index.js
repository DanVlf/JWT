const express = require('express')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const serveIndex = require('serve-index')
const app = express()

const port = 80

const secret = "QOLEJDHFBEQSSD"

const privateKey = fs.readFileSync(path.parse(process.mainModule.filename).dir + '/certs/private.key')
const publicKey = fs.readFileSync(path.parse(process.mainModule.filename).dir + '/certs/public.key')

const user = {username: "velkyUzivatel", password: "uzivatelovoHeslo"}

app.use('/backup', express.static(path.parse(process.mainModule.filename).dir + '/backup'), serveIndex(path.parse(process.mainModule.filename).dir + '/backup', {'icons': true}))

app.use(bodyParser.json())


function checkAuth(req, res, next) {
    console.log(req.body)
    var username = req.body.username
    var password = req.body.password
    var token = req.body.token
    console.log(password + " " + password);
    if (token === undefined) {
        console.log('invalid token')
        res.status(401).send('Invalid token')
        return false;
    }
    console.log(token)
    jwt.verify(token, secret, function(err, decoded) {
        console.log(decoded)
        if (err) {
            console.log(err)
        }
        else if (decoded != undefined) {
	    if (decoded.admin) {
                console.log('valid token')
                next()
	    }
	    else {
		console.log("not admin")
	        res.status(401)
		res.send("not admin")
	    }
        }
        else {
            console.log('invalid token')
            res.status(401).send('Invalid token')
        }
    });
}


app.get('/', function(req, res){
    res.sendFile(path.parse(process.mainModule.filename).dir + '/index.html')
})


// Login - vrátí JWT token
app.post('/login', function (req, res) {
    console.log(req.body)
    let username = req.body.username
    let password = req.body.password
    console.log(username + " /login " + password);
    if (username === user.username && password === user.password) {
        let data = { username: user.username, loggedIn: true }
        let token = jwt.sign(data, secret)
        res.status(200)
        res.send(token)
    }
    else {
        res.status(401)
        res.send('Username or password is not valid.')
    }
})

app.use('/get-flag', function(req, res, next) {
    checkAuth(req, res, next)
})

app.post('/get-flag', function (req, res) {
    res.send('flag{FLAG}')
})






// Spuštění HTTP serveru
app.listen(port, function() {
    console.log(`Listening on port ${port}!`)
})
