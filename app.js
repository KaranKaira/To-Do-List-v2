//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


// connect to database
mongoose.connect('mongodb://localhost:27017/todolistDB',{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// schema for item
const ItemSchema = new mongoose.Schema({
name : String
});

//model
const Item = mongoose.model('Item',ItemSchema);

const item1 = new Item({
  name : "To Item 1"
});

const item2 = new Item({
  name : "To Item 2"
});

const item3 = new Item({
  name : "To Item 3"
});

const defaultItems = [item1,item2,item3];

// Item.insertMany([item1,item2,item3] , (err,docs)=>{
//   if(err) console.log('Error saving default items');
//   else console.log('default items saved');
// });

// schema for list

const listSchema = new mongoose.Schema({
name : String,
items : [ItemSchema]
});
const List = mongoose.model('List',listSchema); 

app.get("/", function(req, res) {
  Item.find({},(err,items)=>{

    if(items.length == 0) Item.insertMany([item1,item2,item3],(err,docs)=>{
      if(err) console.log('error saving the default items for the first item');
      else console.log('Successfully addedd the default items for the first time');
    });
    
      res.render("list", {listTitle: "Today", newListItems: items});
    
    });
  

});

app.get('/lists/:thislist',(req,res)=>{
  
  const thislist =  _.capitalize(req.params.thislist) ;

  List.findOne({name:thislist},(err,foundList)=>{
    if(!err){
      if(foundList===null) {
        //create new list
          const list = new List({
            name : thislist,
            items : [] 
          });
         
          list.save(()=>res.redirect('/lists/' + thislist)); // redirect after saving the list document

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
  if(listName=="Today"){
  item.save(()=>res.redirect('/'));
  }
  else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save(()=>res.redirect('/lists/' + listName));
    });
  }
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
