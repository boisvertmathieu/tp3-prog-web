var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');
const Carte = require('../models/carteSchema');

/* GET users listing. */
router.get('/', checkToken.checkToken, function(req, res, next) {
  res.render('cartes');
});

router.post('/', async (req, res, next) => {

  res.setHeader('Content-Type', 'application/json');

  //TODO Validation des champs avant la modification

    // Recherche sur cue car mongo veut parse en ObjectId tout ce qui est _id
  let carteAffecte = await Carte.findOneAndUpdate(
      {cue: req.body.cue},
      { $set : {
          cue: req.body.cue,
          rep: req.body.rep,
          show: req.body.displayName
        }},
      {
        //Ajout de la carte si rien n'est trouvé
        upsert: true
      }
  );

  if(carteAffecte == null) return res.sendStatus(201);
  else return res.sendStatus(200);

});

module.exports = router;
