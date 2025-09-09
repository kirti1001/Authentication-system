const jwt = require("jsonwebtoken")

const auth =(req, res, next) => {
    //grab a token from cookie
    console.log(req.cookies);  
    const {token} = req.cookies

    //if no token, stop there
    if (!token) {
        res.status(403).send('Please login first')
    }
    //decode that token and get id
    try{
        const decode = jwt.verify(token, 'shhhhh')
        console.log(decode);
        req.user = decode

    }catch (error) {
        console.log(error);
        res.status(401).send("Invalid Token")
    }
    
    
    return next()

}

module.exports = auth