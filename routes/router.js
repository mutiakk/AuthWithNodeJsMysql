const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const uuid=require('uuid');
const jwt = require('jsonwebtoken');

const db = require("../lib/db.js");
const userMiddleware = require("../middleware/users.js");

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
                        `INSERT INTO users (id, username, password, registered) VALUES ('${uuid.v4()}', ${db.escape(
                          req.body.username
                        )}, ${db.escape(hash)}, now())`, (err, result) => {
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

//http://localhost:3000/api/secret
router.post('/secret', (req, res, next) => { });

module.exports=router;