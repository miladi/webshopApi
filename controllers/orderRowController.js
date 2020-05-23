const db = require('../db');

orderRowController = () => {
  
  get = async (req, res) => {
    try {
      const records = await db.get(req, res, 'orderrow');

      if(records.length == 0){
        res.status(404);
        return res.send('Could not find the resource');
      }
      return res.json(records);

    } catch (err) {
      return res.status(404);
    }
  };





  post = async (req, res) => {
    try {
      return await db.modify(
        req, 
        res, 
        'AddOrderRow',
        'OrderId',
        'ProductId',
        'Price',
        'PercentOff',
        'Count',
        'Total',
        'Tax' 
      );
    }
    catch (err) {
      res.status(500);
      console.log(err);
      return res.send('Unable to create');
    }
  };



  put = async (req, res) => {
    try {
        return await db.modify(
          req, 
          res, 
          'UpdateOrderRow',
          'OrderId',
          'ProductId',
          'Price',
          'PercentOff',
          'Count',
          'Total',
          'Tax' 
        );
    }
    catch (err) {
        res.status(500);
        return res.send('Unable to update');
    }
  };



  remove = async (req, res) => {
    try {
        await db.modify(req, res, 'DeleteOrderRow');
    }
    catch (err) {
        console.log(err);
        res.status(500);
        return res.send('Unable to Delete');
    }
  };
  return { get, post, put, remove }
}

module.exports = orderRowController;