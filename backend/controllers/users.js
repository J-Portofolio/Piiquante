const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res) => {
    // Salage et Hachage du mot de passe envoyé via le formulaire d'inscription
    // avant l'opération d'ajout de l'utilisateur
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            user.save()
                .then(user => res.status(201).json({message: 'Votre compte '+ user.email +' a été créé avec succès.'}))
                .catch(error => res.status(400).json({error}))
        })
        .catch(error => res.status(500).json({error}));
};

exports.login = (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            // L'uniformisation' des messages d'erreur est volontaire afin de ne pas aiguiller
            // un éventuel attaquant qui chercherait à usurper un compte par exemple.
            if (user === null) {
                return res.status(403).json({message: 'L\'authentification a échoué !'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valide => {
                    if (valide === false) {
                        return res.status(403).json({message: 'L\'authentification a échoué !'})
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jsonwebtoken.sign(
                            {userId: user._id},
                            process.env.JWT_SECRET,
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => {res.status(500).json({error})});
        })
        .catch(error => res.status(500).json({error}));
};