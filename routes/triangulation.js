const {Router} = require('express');
const router = Router();

router.post('/', async (req, res) => {
   try {
      const coneParameters = {
         height: parseInt(req.body.height),
         radius: parseInt(req.body.radius),
         segments: parseInt(req.body.segments)
      };

      const triangulation = {
         A: {X: 0, Y: 0, Z: coneParameters.height},
         Pi: []
      };

      for (let i = 0; i < coneParameters.segments; i++) {
         triangulation.Pi.push({
            X: coneParameters.radius * Math.cos(2 * Math.PI * i / coneParameters.segments),
            Y: coneParameters.radius * Math.sin(2 * Math.PI * i / coneParameters.segments),
            Z: 0
         });
      }
      res.status(200).json(triangulation);
   } catch (e) {
      console.log(e);
      res.status(500).json({
         message: 'Server error'
      });
   }
});


module.exports = router;