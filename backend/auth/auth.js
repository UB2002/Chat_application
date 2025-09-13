const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


const jwt_secret = process.env.JWT_SECRET;

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        username: user.username
    }, jwt_secret,{
        expiresIn: "3h",
    })
}

const hashPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

const comparePassword = async(password, hash) => {
    return bcrypt.compare(password, hash);
};


module.exports = {
    generateToken,
    hashPassword,
    comparePassword,
};