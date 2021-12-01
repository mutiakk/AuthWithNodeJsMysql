const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const uuid=require('uuid');
const jwt = require('jsonwebtoken');
// const Cart = require('../routes');

const db = require("../lib/db.js");
// const cartMiddleware = require("../middleware/carts.js");
const userMiddleware = require("../middleware/users.js");
const e = require('express');

//http://localhost:3000/api/signup
router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
    db.query(`SELECT id FROM users WHERE LOWER (username) = LOWER (${req.body.username})`, (err, result) => {
        if (result && result.length) {
            return res.status(409).send({
                message: 'already use'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).send({
                        message: err,
                    })
                } else {
                    db.query(
                        `INSERT INTO users (id, username, password, registered) VALUES ('${uuid.v4()}',   
                          req.body.username)}, ${db.escape(hash)}, now())`, (err, result) => {
                        if (err) {
                            throw err;
                            return res.status(400).send({
                                message: err
                            })
                        }
                        return res.status(201).send({
                            message: "Registered!"
                        })
                    })
                }
            })
        }
    });

});

//http://localhost:3000/api/login
// routes/router.js

router.post('/login', (req, res, next) => {
    db.query(
      `SELECT * FROM users WHERE username = ${db.escape(req.body.username)};`,
      (err, result) => {
        // user does not exists
        if (err) {
          throw err;
          return res.status(400).send({
            msg: err
          });
        }
  
        if (!result.length) {
          return res.status(401).send({
            msg: 'Username or password is incorrect!'
          });
        }
  
        // check password
        bcrypt.compare(
          req.body.password,
          result[0]['password'],
          (bErr, bResult) => {
            // wrong password
            if (bErr) {
              throw bErr;
              return res.status(401).send({
                msg: 'Username or password is incorrect!'
              });
            }
  
            if (bResult) {
              const token = jwt.sign({
                  username: result[0].username,
                  userId: result[0].id
                },
                'SECRETKEY', {
                  expiresIn: '7d'
                }
              );
  
              db.query(
                `UPDATE users SET login = now() WHERE id = '${result[0].id}'`
              );
              return res.status(200).send({
                msg: 'Logged in!',
                token,
                user: result[0]
              });
            }
            return res.status(401).send({
              msg: 'Username or password is incorrect!'
            });
          }
        );
      }
    );
  });

// product
router.get('/listProduct', (req, res)=>{
  db.query('SELECT * FROM produk', (err,rows, fields)=>{
    if (!err)
    res.send(rows)
    else
    console.log(err);
  })  
}) 

router.get('/listProduct/:id', (req, res)=>{
  let id= req.params.id;
  db.query('SELECT * FROM produk where id=?',[id], (err,rows, fields)=>{
    if (!err)
    res.send(rows)
    else
    console.log(err);
  })  
}) 

router.delete('/cart/:idOrder', (req, res)=>{
  let id= req.params.idOrder;
  db.query('DELETE FROM cart where idOrder=?',[id], (err,rows, fields)=>{
    if (!err){
    return res.status(200).send({
      msg: 'Item Deleted'
    });
  }else{
    console.log(err);
  }
    
  })  
}) ;


router.post('/addToCart', (req, res)=>{
  let ay= req.body;
  db.query('SELECT idCart, qty FROM cart where idCart=?',[ay.idCart], (err,rows, fields)=>{
    if (!err){
      if(rows.length === 0 ){
        db.query('INSERT INTO `cart` (idOrder, idCart,qty) VALUES (?,?,?)',[ay.idOrder, ay.idCart,ay.qty], (err,rows, fields)=>{
          if (!err){
            return res.status(401).send({
              msg: 'Item Added'
            });
          }else{
            console.log(err);
          }
        });
      }else{
        //update
        let qty= rows[0].qty+ay.qty;
        db.query('UPDATE `cart` SET qty=?  WHERE idCart=?',[qty, ay.idCart], (err,rows, fields)=>{
          if (!err){
            return res.status(200).send({
              msg: 'Item Updated'
            });
          }else{
            console.log(err);
          }
        });
      }
    }else{
      console.log(err);
    }
  });  
  
});

router.post('/cartPlus', (req, res)=>{
  let ay= req.body;
  db.query('SELECT idCart, qty FROM cart where idCart=?',[ay.idCart], (err,rows, fields)=>{
    if (!err){
      if(rows.length === 0 ){
        db.query('INSERT INTO `cart` (idOrder, idCart,qty) VALUES (?,?,?)',[ay.idOrder, ay.idCart,ay.qty], (err,rows, fields)=>{
          if (!err){
            return res.status(200).send({
              msg: 'Item Added'
            });
          }else{
            console.log(err);
          }
        });
      }else{
        //update
        let qty= rows[0].qty+1;
        db.query('UPDATE `cart` SET qty=?  WHERE idCart=?',[qty, ay.idCart], (err,rows, fields)=>{
          if (!err){
            return res.status(401).send({
              msg: 'Item Updated'
            });
          }else{
            console.log(err);
          }
        });
      }
    }else{
      console.log(err);
    }
  });  
  
});

router.post('/cartmin', (req, res)=>{
  let ay= req.body;
  db.query('SELECT idCart, qty FROM cart where idCart=?',[ay.idCart], (err,rows, fields)=>{
    if (!err){
      if(rows.length === 0 ){
        db.query('INSERT INTO `cart` (idOrder, idCart,qty) VALUES (?,?,?)',[ay.idOrder, ay.idCart,ay.qty], (err,rows, fields)=>{
          if (!err){
            return res.status(200).send({
              msg: 'Item Added'
            });
          }else{
            console.log(err);
          }
        });
      }else{
        //update
        let qty= rows[0].qty-1;
        db.query('UPDATE `cart` SET qty=?  WHERE idCart=?',[qty, ay.idCart], (err,rows, fields)=>{
          if (!err){
            return res.status(200).send({
              msg: 'Item Min'
            });
          }else{
            console.log(err);
          }
        });
      }
    }else{
      console.log(err);
    }
  });  
  
});

router.get('/listCart', (req, res)=>{
  db.query('SELECT a.idOrder, a.idCart, a.qty,b.id,b.name,b.price, b.image FROM cart AS a INNER JOIN produk AS b ON a.idCart= b.id;', (err,rows, fields)=>{
    if (!err){
      return res.status(200).send(
        rows
      );
    }else{
      console.log(err);
    }
  })  
}) 

router.post('user/profile',(req,res)=>{
  db.query
})
module.exports=router;