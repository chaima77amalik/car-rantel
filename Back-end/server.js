const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./data/db');
const crypt = require('bcrypt')
const port = 3000

const app = express();
app.use(cors());
app.use(bodyParser.json());

//API CAR

app.get('/cars',(req,res) =>{
    db.query('SELECT * FROM car',(err,result)=>{
        if(err) {res.status(500).json({message : "server not found"})} 
        res.json(result)

    })
} )

app.get('/cars/:id' ,(req,res)=>{
    const id = req.params.id
    db.query('SELECT * FROM car WHERE id=? ',[id],(err,result) =>{
        if(err) {res.status(500).json({message: "server not found"})}
        if(result.length === 0){
            res.status(404).json({message:"card not found"})
        }
        res.json(result)
    })
})

app.post('/new-car', (req,res)=>{
    const {brand,serie,immatriculation,modele,launchYear,status}= req.body
    if(!brand || !serie || !immatriculation || !modele || !launchYear || !status){
        return req.status(400).json({message: 'not found'})
    }
    const sql = 'INSERT INTO car (brand,serie,immatriculation,modele,launchYear,status) VALUE (?,?,?,?,?,?)'

    db.query(sql,[brand,serie,immatriculation,modele,launchYear,status],(err,result)=> {
        if(err){
            res.status(500).json({message:'server not found'})
        }
        res.status(201).json({message:'car was add'})
    })
})


app.put('/up-date-car/:id',(req,res) =>{
     const {id} = req.params
    const {brand,serie,immatriculation,modele,launchYear,status}= req.body
   

    const sql = 'UPDATE car SET brand =?,serie =?,immatriculation= ?,modele=? ,launchYear = ?,status= ?  WHERE id=?'
    db.query(sql,[brand,serie,immatriculation,modele,launchYear,status,id], (err,result) =>{
        if(err){
            res.status(400).json({message:'server not found'})
        }
        res.status(200).json({brand,serie,immatriculation,modele,launchYear,status})
    })

})


app.delete('/delete-car/:id',(req,res)=>{
    const {id} = req.params
    const sql = 'DELETE FROM car WHERE id=? '
    db.query(sql,[id],(err,result)=>{
        if(err){
            res.status(400).json({message:'server not found'})
        }
        res.status(200).json({message:'car was deleted'})
    })

})

//API USER

app.post('/register', async (req,res)=>{
    const {firstName,lasttName,email,address,passwrd,phone}= req.body
    if (!firstName || !lasttName || !email || !address || !passwrd || !phone) {
       return res.status(400).json({message: 'server not found'})
    }

    const cryptpassword = await  crypt.hash(passwrd, 15)

    const role = "client"

    const sql= 'INSERT INTO users(firstName,lasttName,email,address,passwrd,phone,role) VALUES(?,?,?,?,?,?,?) '
    db.query(sql,[firstName,lasttName,email,address,cryptpassword,phone,role],(err,result) =>{
        if(err){
            res.status(400).json({message:'problem with server'})
        }
        res.status(200).json({message:'user was add'})
    })
})


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        res.status(200).json({ message: 'Login successful', userId: user.id });
    });
});



app.listen(port, ()=>{
    console.log('server run' +port)
})