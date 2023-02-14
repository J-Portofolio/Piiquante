const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupération du token du Header de requête (Découpage via split d'espaces et récupération de l'index 1)
        const token = req.headers.authorization.split(' ')[1];

        // Décodage du token
        const tokenDecode = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        // Lecture de la de la valeur de clé 'userId' retournée par le décodage de token
        // puis déclaration de l'ID authentique en tant que valeur de 'req.auth.userId'
        const userId = tokenDecode.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        res.status(401).json({error});
    }
};