const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
require('dotenv').config();

const app = express();

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.serveraddreas);

const itemsSchema = new mongoose.Schema({
    name: "String"
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your todo list"
});

const item2 = new Item ({
    name: "buy a car"
});

const item3 = new Item ({
    name: "buy a toy"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: "String",
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    const foundItems = Item.find({ }).then(function(foundItems){

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems)
            res.redirect("/")

        }



        res.render('list', {listTitle: "Today", newListItems: foundItems});
    })
    .catch(function(err){
        console.log(err);
    });



});


app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    const found_list = List.findOne({name: customListName}).then(function(found_list){
        if (!found_list) {
            const list = new List({
                name: customListName,
                items: defaultItems
                });

            list.save();
            res.redirect("/" + customListName);

            } else {
                res.render('list', {listTitle: found_list.name, newListItems: found_list.items})
            }
    })
})

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;


    const item = new Item ({
    name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        const foundList = List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });


    }

})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox.trim();
    const listName = req.body.listName;

    if (listName === "Today"){
        const tell = Item.findByIdAndDelete(checkedItemId).then(function(tell){
        console.log(tell);
        res.redirect("/");
    });
    } else {
        const deleteList = List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(deleteList){
            res.redirect("/" + listName);
        })
    }
})


app.post("/work", function(req, res){
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.get("/about", function(req, res){
    res.render('about');
})




























app.listen(3000, function() {
    console.log("Server is running on port 3000.");
});
