// TODO::
// 1. ADD CLICKABLE BUTTON ON HOME PAGE WHICH LINK TO THAT LIST PAGE - DONE
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



// connect to database
mongoose.connect('mongodb://localhost:27017/todolistDB2',{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// schema for item
const ItemSchema = new mongoose.Schema({
name : String
});

//model
const Item = mongoose.model('Item',ItemSchema);


// schema for list

const listSchema = new mongoose.Schema({
name : String,
items : [ItemSchema]
});
const List = mongoose.model('List',listSchema); 

//schema for holding all lists
const all_listSchema = new mongoose.Schema({
  // name of list
  name : String
});

const All_List = mongoose.model('all_list',all_listSchema);



app.get("/", function(req, res) {

  res.redirect('/lists');
 

});
app.get('/lists',(req,res)=>{

  let lists = [];
  All_List.find({},(err,docs)=>{
  docs.forEach(doc =>lists.push(doc));
  res.render('home',{All_List:lists});
  
});

});

app.get('/lists/:thislist',(req,res)=>{
  
  const thislist =  _.capitalize(req.params.thislist) ;

  List.findOne({name:thislist},(err,foundList)=>{
    if(!err){
      if(foundList===null) {
        console.log('null is there')
        //create new list
          const list = new List({
            name : thislist,
            items : [] 
          });
         const newList = new All_List({
           name : thislist
         });
        
         newList.save();
         list.save();
         res.redirect('/lists/' + thislist);

        }
      else {
        res.render('list',{listTitle: foundList.name, newListItems: foundList.items}); 
      }
   }
 
  });
 
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save(()=>res.redirect('/lists/' + listName));
    });
  
});

app.post('/lists',(req,res)=>{

 const newListName = _.capitalize(req.body.newListName);
  
  All_List.findOne({name:newListName},(err,doc)=>{
    if(doc===null){

      const newList = new All_List({
        name : newListName
      });
      const list = new List({
       name : newListName,
       items : [] 
     });
     newList.save();
     list.save();
    }
    
  });


 res.redirect('/');
});


app.post('/deletelist',(req,res)=>{
  const checkList = req.body.checkbox;
  const listName = req.body.listName;
  All_List.findByIdAndRemove(checkList,(err)=>{});
  List.deleteOne({name : listName},(err)=>{
  });
  res.redirect('/');
});

app.post('/deletetodoitem',(req,res)=>{
 
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == 'Today'){
  Item.findByIdAndRemove(checkedItem,(err)=>{ }); 
    res.redirect('/');
   }
  else {
      List.findOne({name:listName},(err,foundList)=>{
          foundList.items = foundList.items.filter(item => item._id != checkedItem);
          foundList.save(()=>res.redirect('/lists/' + listName));
      });
  }

  
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
