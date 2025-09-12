const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
    // Surface a clear error early to avoid generating unverifiable tokens
    throw new Error("JWT_SECRET is not set. Please define it in environment or .env");
}

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

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ message: "Missing token" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, jwt_secret);
        req.user = decoded; // attach decoded user to request
        next();
    } 
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

}

module.exports = {
    generateToken,
    hashPassword,
    comparePassword,
    verifyToken
};