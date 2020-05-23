const sql = require('mssql');
const config = require('./config');

//Anropas av get funktionen. hateoas är array av objekt
createHateoasLinks = (req, records, hateoas) =>{

  return records.recordset.map((record) => {
    record.links = {};

    hateoas.forEach( (link) =>{
        //link.property kan vara Id
        record.links[link.property.toLowerCase() == 'id' ? 'self' : link.property.toLowerCase()] =
        `http://${req.headers.host}/api/${link.endpoint}/${record[link.property]}` // om PK nyckeln heter Id 

        // record.links[link.property.toLowerCase() == `${link.endpoint}id` ? 'self' : link.property.toLowerCase()] =
        // `http://${req.headers.host}/api/${link.endpoint}s/${record[link.property]}`

    });

    return record;
  });
}






createSqlParameters = (req, res, ...bodyProperties) => {
  try {
      let hasAllBodyProperties = false;
      let id = '';

      if (req.method.toUpperCase() == 'PUT' && req.params.hasOwnProperty('Id') && req.params.Id > 0)
          id = `${req.params.Id},`;
      else if (req.method.toUpperCase() == 'DELETE' && req.params.hasOwnProperty('Id') && req.params.Id > 0)
          id = `${req.params.Id}`;
      else if (req.method.toUpperCase() != 'POST'){
          res.status(400);
          return res.send('Valid Id URI parameter is required');
      }

      let sqlParameters = `${id} `;  //innehåller id om put eller delete

      // property namn string eller object
      bodyProperties.forEach(prop => {
          let hasProperty = false;
          let value = null;
          if (typeof prop === 'string') {
              hasProperty = req.body.hasOwnProperty(prop);
              
              hasAllBodyProperties = hasAllBodyProperties || hasProperty;
              value = req.body[prop];
              console.log(prop+': '+value);
          }
          else if (typeof prop === 'object') {
              let propertyName = Object.getOwnPropertyNames(prop)[0]; //returns an array of all properties, first element
              hasProperty = req.body.hasOwnProperty(propertyName);
              if (hasProperty) {
                  hasAllBodyProperties = hasAllBodyProperties || hasProperty;
                  value = req.body[propertyName];
              }
              else value = prop[propertyName];
          }

          //lägg property till strängen
          if (typeof value === 'string')
              sqlParameters += `'${value}',`;
          else if (typeof value === 'number')
              sqlParameters += `${value},`;
          else if (typeof value === 'boolean')
              sqlParameters += value ? `1,` : `0,`;
          else if (value === null){
              sqlParameters += `${value},`;
          }
      });

      if (!hasAllBodyProperties && bodyProperties.length > 0) {
          res.sqlError = 'Missing or erroneous properties';
          res.status(400);
          return;
      }

      res.sqlParameters = sqlParameters.substring(0, sqlParameters.length - 1);
      res.status(201);
  }
  catch (err) {
      res.sqlError = 'Missing or erroneous properties.';
      res.status(500);
  }
}





jsonKeysToLowerCase = (record) => Object.fromEntries(
  Object.entries(record).map(([k, v]) => [k[0].toLowerCase()+k.substring(1), v]));








get = async (req, res, endpoint, hateoas = [], ...params)=>{

  try {
    
    let parameters = '';
    let endpointPluralSpelling = endpoint+'s';
    params.forEach(param => parameters += `, ${param}`);  //array till string

    

    if(endpoint.endsWith('y')){ endpointPluralSpelling = `${endpoint.substring(0, endpoint.length-1)}ies`; }
    if(endpoint.endsWith('s')||endpoint.endsWith('x')){ endpointPluralSpelling = `${endpoint}es`; }
    
    let query = req.params.Id > 0 ?
        `EXEC Get${endpoint} ${req.params.Id}${parameters}` :
        `EXEC Get${endpointPluralSpelling} ${parameters.length < 2 ? '' : parameters.substring(2)}`; //tar bort första kommatecknet

    await sql.connect(config);
    let result = await sql.query(query);

    if (result.recordset.length == 0) {
        res.status(404);
        return result;
    }

    hateoas.push({ property: 'Id', endpoint: `${endpointPluralSpelling}` }); //Om PK nycklar heter Id

    const records = createHateoasLinks(req, result, hateoas);

    return req.params.Id > 0 ? records[0] : records;
  }
  catch (err) {
      console.log(err);
      throw err;
  }

}


getByCompositeKey = async (req, res, endpoint, ...params) => {


    try {

        if(!req.query.firstKey || (Object.keys(req.query).length > 1 && !req.query.secondKey)){
            res.sqlError = 'Missing or erroneous properties';
            res.status(400);
            return res.send(res.sqlError);
        }

        let parameters = '';
        let endpointPluralSpelling = endpoint+'s';
        params.forEach(param => parameters += `, ${param}`);  //array till string
        

        
        let query = '';
        if(Object.keys(req.query).length > 0){
            query = (Object.keys(req.query).length > 1) ?
            `EXEC Get${endpoint} ${req.query.firstKey}, ${req.query.secondKey} ${parameters}`:
            `EXEC Get${endpointPluralSpelling} ${req.query.firstKey}${parameters}`;
        }
        await sql.connect(config);
        let result = await sql.query(query);
        

        if (result.recordset.length == 0) {
            res.status(404);
            return result;
        }
        return (Object.keys(req.query).length > 1) ? result.recordset[0] : result.recordset;
    }
    catch(err) {
        console.log(err);
        throw err;  
    }
}




modify = async (req, res, sp, ...bodyProperties) => {
  try {
      
      createSqlParameters(req, res, ...bodyProperties);
      if (res.sqlError) return res.send(res.sqlError);

      await sql.connect(config);
      var result = await sql.query(`EXEC ${sp} ${res.sqlParameters}`);
        console.log(res);
      if(req.method.toUpperCase() == 'PUT' || req.method.toUpperCase() == 'DELETE') {
          res.status(204);
          return res.send(req.method.toUpperCase() == 'PUT' ? 
              'Updated successfully': 'Deleted successfully');
      }
      // Endast POST
      res.status(201);
      return res.json(jsonKeysToLowerCase(result.recordset[0]));
  }
  catch (err) {
      console.log(err);
      throw err;
  }
}




module.exports = { get, modify, getByCompositeKey };