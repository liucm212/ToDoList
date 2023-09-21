const { v4: uuidv4 } = require('uuid'); //unique id pakacge
const http = require('http') //import http object into http variable
const errHandle = require('./errHandle')

const toDoList =[ //data of ToDOList
    {
      title : '打羽球',
      content : '明天下午看看泓有沒有約打球。',
      id : uuidv4()
    },
    {
      title : '睡覺',
      content : '中午吃飽飯睡20分鐘。',
      id : uuidv4()
    }
]


function requestListener(req, res){ // the function to manipulate server
  const headers = {
    //Access-Control系列都是讓網站可以跨網域使用的設定。
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',//允許使用的方法
   'Content-Type': 'application/json'
  }
  // post 預處理
  // 接收資料
  let rawData = '';
  req.on('data', (chunk) => { 
    rawData += chunk; 
  });

  // asign req data into new variables
  const reqUrl = req.url
  const reqMethod = req.method
  
  // 判斷 url & method 來決定要回傳什麼。
  switch(true){
    // Options method
    case (reqUrl == '/todolist' && reqMethod == 'OPTIONS'): //options preflight
    {
      res.writeHead(200, headers) // setting status and head in response 
      res.end()  //end the server response
      break
    }

    // Get method
    case (reqUrl == '/todolist' && reqMethod == 'GET'): //get page of index
    {
      res.writeHead(200, headers) // setting status and head in response 
      res.write(JSON.stringify({
        status : 'true',
        result : 'success',
        data : toDoList
      })) //write response in page
      res.end()  //end the server response
      break
    }
    
    // Post method
    case (reqUrl == '/todolist' && reqMethod == 'POST'): //post data
    {
      // 接完資料後做最後處理
      req.on('end', () => { 
        try {
          const title = JSON.parse(rawData).title //get the title from req data
          const content = JSON.parse(rawData).content //get the content from req data
          if(title != undefined){ //if title is not empty, go to next step.
            const newToDo = { //建立一個儲存新代辦事項的物件
              title : title,
              content : content,
              id : uuidv4()
            }
            toDoList.push(newToDo) //將新事項push到toDoList裡面
            res.writeHead(200, headers) // setting status and head in response 
            res.write(JSON.stringify({
              status : true, 
              result : 'success',
              data : toDoList, //data 裡面放 toDoList
            })) //write response in page
            res.end()  //end the server response
          }else{
            errHandle(res, headers)
          }
        } catch (e) {
          errHandle(res, headers)
        }
        
      });
      break
    }

    // Patch method : 找出開頭是/todolist/的url
    case (reqUrl.startsWith('/todolist/') && reqMethod == 'PATCH'): //patch data
    {
      req.on('end', ()=>{
        try{ // try catch檢查req的資料是否是正常json格式。
          const title = JSON.parse(rawData).title //get the title from req data
          const content = JSON.parse(rawData).content //get the content from req data
          const id = reqUrl.split('/').pop() //將id用split切割成三份，再用pop()把最後一個元素取出來。
          const idIndex = toDoList.findIndex((obj)=>{//用findIndex找出toDoList內有相同id的物件
            return obj.id = id
          })

          if(title != undefined && idIndex >= 0){ //如果title不是undefined && toDoList內有找到符合的物件，就可以執行更改。
            toDoList[idIndex].title = title
            toDoList[idIndex].content = content
            res.writeHead(200, headers) // setting status and head in response 
            res.write(JSON.stringify({
              status : true, 
              result : 'success',
              data : toDoList
            })) //write response in page
            res.end()  //end the server response
          }
        }catch(e){ //error haddling
          errHandle(res, headers)
        }
      });
      break
    }


    // Delete all : RESTFULapi的特性，/todolist + DELETE method代表刪除全部
    case (reqUrl == '/todolist' && reqMethod == 'DELETE'): //post data
    {
      toDoList.length = 0 //let length of toDoList arr to be 0, then the data of the arr would be empty.
      res.writeHead(200, headers) // setting status and head in response 
      res.write(JSON.stringify({
        status : true, 
        result : 'success',
        data : toDoList
      })) //write response in page
      res.end()  //end the server response
      break
    }

    //Delete single task：如若以/todolist/開頭 + DELETE method，就是刪除單個任務
    case(reqUrl.startsWith('/todolist/')  && req.method == 'DELETE') :{
      try{ // try catch檢查req的資料是否是正常json格式。
        const id = reqUrl.split('/').pop() //取出id
        const idIndex = toDoList.findIndex((obj)=>{ //找出相同的
          return obj.id == id
        })
        if(idIndex >= 0){ //沒有該id
          toDoList.splice(idIndex, 1)
          res.writeHead(200, headers) // setting status and head in response 
          res.write(JSON.stringify({
          status : true, 
          result : 'success',
          data : toDoList
          }))
          res.end()
        }else{ // 有該id
          errHandle(res, headers) //error haddling
        }
      }catch(err){
        errHandle(res, headers) //error haddling
      }
      break
    }

    // 404 not found : 如果不是以上url，就都會是這case處理。
    default: {
      res.writeHead(404, headers) // setting status and head in response 
      res.write(JSON.stringify({
        state : 'false',
        message : '無此網站路由'
      })) //write response in page
      res.end()  //end the server response
      break
    }
  }
  
} 
// 建立一個server來監聽網頁
const server = http.createServer(requestListener)
server.listen(process.env.PORT || 3333) //依據環境吃port號