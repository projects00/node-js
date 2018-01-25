

const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookie = require('cookie-parser');
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const bycrypt = require('bcryptjs');
const local = require('passport-local').Strategy;
const app = express();
var MySQLStore=require('express-mysql-session')(session);
var options = {
     host: 'mysql7002.site4now.net',
    user: 'loaqey4v_nandhu',
    password: 'nandhu',
    database: 'loaqey4v_testnkdb'
 
};
var sessionStore = new MySQLStore(options);
const connect = mysql.createPool({
    host: 'mysql7002.site4now.net',
    user: 'loaqey4v_nandhu',
    password: 'nandhu',
    database: 'loaqey4v_testnkdb',
    native    : true,
    pool       : { maxConnections: 50, maxIdleTime: 30}
});
const UPLOAD_PATH = 'uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        let extension = file.originalname.split('.')[1]
        cb(null, file.fieldname + "-" + Date.now() + "." + extension);
    }
})


const upload = multer({ storage: storage })




let tornamentTable = `CREATE TABLE IF NOT EXISTS test( id INT PRIMARY KEY AUTO_INCREMENT, 
    NAME VARCHAR(255), category VARCHAR(255), customvalue1 VARCHAR(255),
 customvalue2 VARCHAR(255), typeid INT, cityid INT, isActive INT ) `;
let cityTable = `CREATE TABLE IF NOT EXISTS cityMaster(
    id INT PRIMARY KEY AUTO_INCREMENT,
    cityname VARCHAR(255),isActive INT default 0
);`;

let typeTable = `CREATE TABLE IF NOT EXISTS typeMaster(
    id INT PRIMARY KEY AUTO_INCREMENT,
    typename VARCHAR(255),isActive INT default 0);`;

connect.query(tornamentTable, (err, result, fields) => {
    if (err) {
        console.log(err);
    }
});
connect.query(cityTable, (err, result, fields) => {
    if (err) {
        console.log(err);
    }
});
connect.query(typeTable, (err, result, fields) => {
    if (err) {
        console.log(err);
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookie());
app.use(session({secret:'secret',
resave:false,
saveUninitialized:true,
 store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new local(
  function(userid, done) {
    console.log('local strategy called with: %s', userid);
    return done(null, {userid});
  }));
// cross origin mioddleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    next();
});

app.use('/static', express.static('Icons'))

app.get('/', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();

        }
        connection.query("select t.id,t.name,t.cityid,t.typeid,t.category,t.customvalue1,t.customvalue2,c.cityname,ty.typename from tournament t join citymaster c on t.cityid = c.id join typemaster ty on t.typeid = ty.id  where t.isActive = 0 ORDER BY t.id ASC", (err, row) => {
            if (err) {
                res.json({ error: err })
            } else {
                res.json(row)
            }
            connection.release();
        });
    });

});



app.post('/insert', (req, res) => {


    const query = "insert into tournament set ?";
    const data = {
        id: null,
        name: req.body.name,
        category: req.body.category,
        customvalue1: req.body.customvalue1,
        customvalue2: req.body.customvalue2,
        isActive: 0,
        typeid: req.body.typeid,
        cityid: req.body.cityid
    };

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();

        }

        connection.query(query, data, (error) => {
            if (error) {
                res.json({ error: error })
            }
            res.json({ message: 'insert' });
            connection.release();
        })



    })





})

app.put('/update/:id', (req, res) => {


    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = `UPDATE tournament set name=?,category=?,
customvalue1=?,customvalue2=?,typeid=?,cityid=?, isActive=0  Where id =?`
        connection.query(query, [req.body.name, req.body.category, req.body.customvalue1, req.body.customvalue2, req.body.typeid, req.body.cityid, req.params.id], (err) => {
            if (err) {
                res.json({ error: err });
            }
            res.json({ message: 'update' });
        })


        connection.release();
    })

})
app.put('/delete/:id', (req, res) => {


    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }
        let query = "UPDATE tournament set isActive = 1 WHERE id = ?";

        connection.query(query, [req.params.id], (err) => {
            if (err) {
                res.json({ error: err })
            }
            res.json({ message: 'deleted' })
        })
        connection.release();
    })


})

app.post('/insert/city', (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }
        let query = `insert into citymaster set ?`
        let data = {
            id: null,
            cityname: req.body.cityname
        }

        connection.query(query, data, (err) => {
            if (err) {
                res.json({ error: err })
            }
            res.json({ message: 'city added' })
        })


        connection.release();
    })


})


app.get('/city', (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }
        let query = `select * from citymaster where isActive = 0`

        connection.query(query, (err, row) => {
            if (err) {
                res.json({ err: err })
            }
            res.json(row)
        })
        connection.release();

    })


})

app.get('/sports', (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = `select * from sportsmaster where isActive = 0`

        connection.query(query, (err, row) => {
            if (err) {
                res.json({ err: err })
            }
            res.json(row)
        })
        connection.release();
    })


})

app.get('/citysportsmapping', (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = `select * from citysportsmapping a inner join sportsmaster b on a.sportsid=b.id where a.isactive=0`

        connection.query(query, (err, row) => {
            if (err) {
                res.json({ err: err })
            }
            res.json(row)
        })

        connection.release();
    })


})

app.post('/insert/type', (req, res) => {


    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }
        let query = `insert into typemaster set ?`
        let data = {
            id: null,
            typename: req.body.typename
        }

        connection.query(query, data, (err) => {
            if (err) {
                res.json({ error: err })
            }
            res.json({ message: 'type added' })
        })
        connection.release();
    })



})


app.get('/type', (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }
        let query = `select * from typemaster where isActive = 0`

        connection.query(query, (err, row) => {
            if (err) {
                res.json({ err: err })
            }
            res.json(row)
        })

        connection.release();
    })



})

app.put('/delete/city/:id', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }
        let query = `update citymaster c left join tournament t on c.id = t.cityid set c.isActive = 1 where c.id = ? and (t.isActive = 1 or t.isActive is null)`;

        connection.query(query, [req.params.id], (err, result) => {

            res.json({ "message": result.affectedRows })
        })

        connection.release();
    })


})


app.put('/delete/type/:id', (req, res) => {
    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = `update typemaster c left join tournament t on c.id = t.typeid set c.isActive = 1 where c.id = ? and (t.isActive = 1 or t.isActive is null)`;

        connection.query(query, [req.params.id], (err, result) => {
            res.json({ "message": result.affectedRows })
        })
        connection.release();

    })


})


app.post('/post/img', upload.single('img'), (req, res, next) => {
    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = "insert into bannermaster set image = ?"
        connection.query(query, [req.file.filename], (err, result) => {
            if (result instanceof Error) {
                // handle the error safely
                console.log('4/2=err', result)
            }
            else {
                // no error occured, continue on
                console.log('4/2=' + result)
            }

            res.json({ result: result })
        })
        connection.release();
    })


})

app.get("/get/img", (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = "select * from bannermaster"
        connection.query(query, (err, result) => {
            if (result instanceof Error) {
                // handle the error safely
                console.log('4/2=err', result)
            }
            else {

                // no error occured, continue on
                console.log('4/2=' + result)
            }
            res.json(result)
        })
        connection.release();
    })

})

app.get("/get/img/:id", (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = "select image from bannermaster where id = ?"
        connection.query(query, [req.params.id], (err, row) => {

            if (row.length == 0) {

                res.json({ 'message': "err" })
            } else {
                console.log(row)
                let img = row[0].image;
                res.setHeader('Content-Type', "image/jpeg", "image/png", "image/gif", "image/svg");
                if (fs.existsSync(path.join(UPLOAD_PATH, img))) {

                    fs.createReadStream(path.join(UPLOAD_PATH, img)).pipe(res);
                }
                else {
                    res.json({ "err": "error" })
                }


            }

        })

        connection.release();
    })


})


app.get('/get/banner', (req, res) => {

    connect.getConnection((err, connection) => {
        if (err) {
            connection.release();
        }

        let query = "select b.banneractive,b.id,b.title,b.imgageid,bm.image,b.description,b.created from banner b join bannermaster bm on b.imgageid = bm.id where b.isactive = 0";
        
            connection.query(query, (err, row) => {
        
        
                res.json(row)
        
        
            })
            connection.release();
    })
  
})
app.get('/get/banneractive', (req, res) => {
    connect.getConnection((err,connection)=>{
        if(err){
            connection.release();
        }
        let query = "select b.banneractive,b.id,b.title,b.imgageid,bm.image,b.description,b.created from banner b join bannermaster bm on b.imgageid = bm.id where b.banneractive = 0";
        
            connection.query(query, (err, row) => {
                if (err) {
                    res.json(err)
                }
        
                res.json(row)
        
        
            })
            connection.release();
    })

})

app.post("/post/banner", (req, res) => {
    connect.getConnection((err,connection)=>{
        if(err){
            connection.release();
        }
        
    let query = "insert into banner set ?";
    
        let data = {
            id: null,
            title: req.body.title,
            imgageid: req.body.imageid,
            description: req.body.description,
            isactive: 0,
        }
    
        connection.query(query, data, (err, result) => {
            if (err) {
                res.json(err)
            }
            res.json({ message: "inserted" })
        })
      connection.release();
    })

})

app.put('/update/banner/:id', (req, res) => {
connect.getConnection((err,connection)=>{
    if(err){
        connection.release();
    }
    let query = "update banner set imgageid = ?,title = ?,description = ?,banneractive = ?, isactive = 0 where id = ?"
    
        connection.query(query, [req.body.imageid, req.body.title, req.body.description, req.body.banneractive, req.params.id], (err) => {
            if (err) {
                res.json(err)
            }
            res.json("updated")
        })

        connection.release();
})


    
})
app.put('/delete/banner/:id', (req, res) => {
connect.getConnection((err,connection)=>{
    if(err){
        connection.release();
    }
    
    let query = "update banner set isactive = 1 where id = ?"
    
        connection.query(query, [req.params.id], (err) => {
            if (err) {
                res.json(err)
            }
            res.json("deleted")
        })
        connection.release();
})

})

app.get('/get/latest/quote', (req, res) => {
connect.getConnection((err,connection)=>{
    if(err){
        connection.release();
    }
    let query = "select * from quotes where id in (select max(id) from quotes where isactive=0)"
    connection.query(query, (err, result) => {
        if (err) {
            res.json(err)
        }

        res.json(result)
    })
connection.release();
})

    
})


app.get("/get/quotes", (req, res) => {
connect.getConnection((err,connection)=>{
    if(err){
        connection.release();
    }
    
    let query = "select * from quotes where isactive = 0"
    
        connection.query(query, (err, row) => {
            if (err) {
                return
            }
            res.json(row)
        })
    
connection.release();    
})
})

app.post('/post/quotes', (req, res) => {
connect.getConnection((err,connection)=>{
    if(err){
        connection.release();
    }

    let query = "insert into quotes set ?"
    
        let data = {
            id: null,
            author: req.body.author,
            quote: req.body.quote,
        }
    
        connection.query(query, data, (err, result) => {
            if (err) {
                res.json(err)
            }
            res.json(result)
        })
        connection.release();
})

})

app.put('/delete/quote/:id', (req, res) => {
connect.getConnection((err,connection)=>{
    if(err){
        connection.release();
    }

    let query = "update quotes set isactive = 1 where id = ?"
    
        connection.query(query, [req.params.id], (err, result) => {
            if (err) {
                res.json(err)
            }
            res.json(result)
        })
connection.release();    
})
    
})


app.put('/update/quote/:id', (req, res) => {
    connect.getConnection((err,connection)=>{
        if(err){
            connection.release();
        }
        let query = "update quotes set author=?,quote=? where id = ?"
        connection.query(query, [req.body.author, req.body.quote, req.params.id], (err, result) => {
            if (err) {
                res.json(err)
            }
            res.json(result)
        })
connection.release();    
    })
    
})


app.get('/get/arena/:cityid', (req, res) => {
    connect.getConnection((err,connection)=>{
        if(err){
        connection.release();    
        }
        
    let query = "SELECT a.id as areaid,a.name as arenaname, a.address1, a.address2, a.state, a.const, i.imagurl, c.cityname, s.name as sportsname FROM areana a INNER JOIN citymaster c ON c.id = a.cityid INNER JOIN sportsmaster s ON s.id = a.sportsid INNER JOIN (select * from imagemaster where id in (select min(id)  from imagemaster group by areaid)) i ON i.areaid = a.id where c.id = ?"
    connection.query(query, [req.params.cityid], (err, row) => {
        res.json(row)
    })
        connection.release();
    })


});

app.get('/get/court/:areaid',(req,res)=>{

    connect.getConnection((err,connection)=>{
        if(err){
            connection.release();
        }
        let query = `select c.id as courtid,c.courtname,a.cityid,a.sportsid,a.name as areaname,a.address1,a.address2,a.state,a.const from courtmaster c inner join areana a on a.id = c.areaid where c.isactive = 0 and c.areaid = ?`
        connection.query(query,[req.params.areaid],(err,row)=>{
            res.json(row)
        })
        connection.release();
    })

})

app.get('/get/:weekid/:courtid/:areaid',(req,res)=>{
    
        connect.getConnection((err,connection)=>{
            if(err){
                connection.release();
            }
            let query = ` call getweekslot(?,?,?);            `
            connection.query(query,[req.params.weekid,req.params.courtid,req.params.areaid],(err,row)=>{
                res.json(row[0])
            })
            connection.release();
        })
    
    })

app.post('/signup',(req,res)=>{
    query = "select * from user where emailid = ?";
password = req.body.password
bycrypt.genSalt(10,(err,salt)=>{
    bycrypt.hash(password,salt,(err,hash)=>{
        password = hash
    })
})
    connect.getConnection((err,connection)=>{
        if(err){
            connection.release();
        }
        
        connection.query(query,[req.body.email],(err,row)=>{
            if(row.length == 0){
                query2 ="insert into user set ?"
                user ={
                    "id":null,
                    "emailid" : req.body.email,
                    "password" :password,
                    "isactive": 0
                }
                connection.query(query2,user,(err,results)=>{
                    if(err){
                        connection.release();
                        
                    }
                    
					   req.login(results.insertId,function(error){
                            console.log("sdfsd"+req.user);
                            console.log(req.isAuthenticated());
                            if(error)
                                res.json(error);
                            
                        });
                    res.json(results);
                })
            }else{
                res.json("user already exist");
            }
        })
        connection.release()
    })



})

app.post('/login', (req, res,next) => {
    console.log(req.user);
 console.log(req.isAuthenticated());
  passport.authenticate('local',{
    successRedirect: '/logged',
    failureRedirect: '/failure',
  })(req,res,next);
});

app.get('/logged',(req,res)=>{
  res.json({msg:"logged in"});
});
app.get('/failure',(req,res)=>{

res.json({msg:"login failed"});

})









passport.use( new local({
    userid:'id',
    passwordField:'password'
},(username,password)=>{
    var user ={
        username : username,
        password : password
    };
    done(null,user)
}))





passport.serializeUser((userid,done)=>{
    done(null,userid);
})
passport.deserializeUser((userid,done)=>{
    done(null,userid);
})


// Using port 5000 or environmental port
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log("Server started ...")
}); 

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    res.json("not logged in");
    // if they aren't redirect them to the home page
   // res.redirect('/');
}
app.get('/logout', function(req, res) {
        req.logout();
        res.json("logged out");
     //   res.redirect('/');
    });

        app.get('/profile', isLoggedIn, function(req, res) {
         res.json("s working");
    });