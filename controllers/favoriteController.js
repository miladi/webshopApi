const db = require('../db');

favoriteController = () => {
  
  get = async (req, res) => {

    try {
      console.log(req);
      const records = await db.getByCompositeKey(req, res, 'favorite');
      console.log('2');
      if(records.length == 0){
        res.status(404);
        return res.send('Could not find the resource');
      }
      
      return res.json(records);

    } catch (err) {
      return res.status(404);
    }
  };




  return { get }
}

module.exports = favoriteController;