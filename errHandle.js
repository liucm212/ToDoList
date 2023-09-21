function errHandle(res, headers){
  res.writeHead(400, headers) // setting status and head in response 
  res.write(JSON.stringify({
    status : false, 
    result : 'fail',
    message : '欄位未填寫正確，或無此ID'
  })) //write response in page
  res.end()  //end the server response
}


module.exports = errHandle