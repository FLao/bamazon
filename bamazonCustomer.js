var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "password",
  database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    //    console.log("connected as id " + connection.threadId);
});

var start = function() {
   
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
            console.log(res);

        inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the ID of the product you would like to buy?"
        }, 
        {
            name: "units",
            type: "input",
            message: "Wow many units of the product you would like to buy?"
        }
        ]).then(function(answer) {

            for(var i = 0; i < res.length; i++) {
                if(res[i].item_id === parseInt(answer.id))
                    checkInStock(parseInt(answer.id), answer.units);
            }
        });
    });
}
start();

function checkInStock(itemID, units) {
    connection.query("SELECT * FROM products WHERE ?", { 
        item_id: itemID
    }, function(err, res) {
        if (err) throw err;
        
        if(res[0].stock_quantity === 0) {
            console.log("Insufficient quantity!");
            start();
        }
        
        else {  
            var newQuantity = res[0].stock_quantity - units;
                
            connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: newQuantity
            }, {
                item_id: itemID
            }], function(err, res) {});

            getPurchasePrice(itemID, units);
            start();            
        }
    });
}

function getPurchasePrice(itemID, units) {
    connection.query("SELECT * FROM products WHERE ?", { 
        item_id: itemID
    }, function(err, res) {
        if (err) throw err;

        var totalCost = res[0].price * units;
        console.log("Total cost: " + totalCost);
    });
}    