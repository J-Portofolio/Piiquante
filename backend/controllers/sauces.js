const Sauce = require('../models/Sauce');
const fs = require('fs');

const LIKE = 1;
const DISLIKE = -1;
const CANCELLIKE = 0;

exports.getAllSauces = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(201).json( sauces ))
        .catch(error => res.status(404).json({ error }));
};

exports.getOneSauce = (req, res) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(201).json( sauce ))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res) => {
    const infosSauce = JSON.parse(req.body.sauce);

    // L'id unique de sauce sera créé et attributé par Mongoose.
    delete infosSauce._id;

    const sauce = new Sauce({
        ...infosSauce,
        userId : req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(sauce => res.status(201).json({message: 'La sauce '+ sauce.name +' a été ajoutée.'}))
        .catch(error => res.status(400).json({error}));
};

exports.updateLikesSauce = (req, res) => {
    const idSauce = req.params.id;

    Sauce.findOne({_id: idSauce})
        .then(objetSauce => 
            {
                
                let actions = null;
                let message = 'La note de la sauce a été mise à jour';

                // Définition des actions effectuées en BDD pour la sauce concernée
                // via un test switch (En fonction de la valeur du like)
                switch(req.body.like) {
                    case LIKE:
                        if (objetSauce.usersLiked.includes(req.auth.userId) === true) {
                            res.status(403).json({error: 'Vous avez déjà modifié la note de '+ objetSauce.name +'.'});
                        }

                        actions = {
                            $inc: {likes: 1},
                            $push: {usersLiked: req.auth.userId}
                        }

                        break;
            
                    case DISLIKE:
                        if (objetSauce.usersDisliked.includes(req.auth.userId) === true) {
                            res.status(403).json({error: 'Vous avez déjà modifié la note de '+ objetSauce.name +'.'});
                        }

                        actions = {
                            $inc: {dislikes: 1},
                            $push: {usersDisliked: req.auth.userId}
                        }

                        break;
            
                    case CANCELLIKE:         
                        if (objetSauce.usersLiked.includes(req.auth.userId) === true) {
                            actions = {
                                $inc: {likes: -1},
                                $pull: {usersLiked: req.auth.userId}
                            }
                        }
                        // Test de présence de l'id utilisateur nécessaire dans les deux tableaux
                        if (objetSauce.usersDisliked.includes(req.auth.userId) === true) {
                            actions = {
                                $inc: {dislikes: -1},
                                $pull: {usersDisliked: req.auth.userId}
                            }
                        }

                        message = 'Votre avez retiré votre note.';
                }

                // Le requête de mise à jour utilisera l'action préalablement définie
                Sauce.updateOne(
                    { _id: idSauce },
                    actions
                )
                .then(() => res.status(201).json({message: message}))
                .catch(error => res.status(400).json({error}));
            }
        )
        .catch(error => res.status(404).json({error}));
};

exports.updateSauce = (req, res) => {
    const sauceId = req.params.id;

    Sauce.findOne({_id: sauceId})
        .then(objetSauce => {

            // Vérification du créateur de la sauce par test d'égalité entre l'id utilisateur
            // de l'objet renvoyé par Mongoose et l'id utilisateur authentifié
            // via le middleware 'auth.js'.
            if(objetSauce.userId !== req.auth.userId) {
                return res.status(403).json({error: 'Seul son créateur peut modifier la sauce '+ objetSauce.name +'.'});
            }

            let infosSauce = {};

            // Test nécessaire de présence de fichier dans la requête
            // pour remplacement de l'image de la sauce dans le stockage serveur
            if (typeof(req.file) !== 'undefined') {
                // Récupération des informations de sauce dans l'objet sauce du corps de requête
                infosSauce = JSON.parse(req.body.sauce);

                // suppression de l'ancienne image de sauce du stockage serveur.
                oldFilename = objetSauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${oldFilename}`, (error) => {
                    if (error) {
                        console.log(error);
                    }
                });

                infosSauce.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            } else {
                // Récupération des informations de sauce dans le corps de requête si pas de fichier envoyé
                infosSauce = req.body;
            }

            Sauce.updateOne({ _id: sauceId}, {...infosSauce, _id: sauceId})
                .then(() =>{
                    res.status(201).json({message: 'La sauce '+ objetSauce.name +' a été mise à jour.'});
                })
                .catch(error => res.status(400).json({error}));
            
        })
        .catch(error => {
            res.status(400).json({ error })
        });
};

exports.deleteSauce = (req, res) => {
    const sauceId = req.params.id;

    Sauce.findOne({_id: sauceId})
        .then(objetSauce => {
            // Test d'authenticité de l'utilisateur via égalité entre l'id user enregistré en BDD et celui utilisé
            // lors de la navigation
            if(objetSauce.userId !== req.auth.userId) {
                res.status(403).json({error: 'Seul son créateur peut supprimer la sauce '+ objetSauce.name +'.'});
            }

            // Nettoyage d'image stockée en back
            const filename = objetSauce.imageUrl.split('/images/')[1];

            fs.unlink(`images/${filename}`, (error) => {
                if (error) {
                    res.status(400).json({error});
                }

                // Suppression de l'entrée de la BDD si nettoyage de fichier image ok.
                Sauce.deleteOne({_id: sauceId})
                    .then(() => { res.status(200).json({message: 'La sauce '+ objetSauce.name +' a été supprimée.'})})
                    .catch(error => res.status(401).json({error}));
            });           
        })
        .catch(error => {
            res.status(400).json({error})
        });
};