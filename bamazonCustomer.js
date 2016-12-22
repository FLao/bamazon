var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "password",
  database: "Bamazon"
});

connection.connect(function(error) {
    if (error) throw error;
    //    console.log("connected as id " + connection.threadId);
});

function start() {
    connection.query("SELECT * FROM products", function(error, response) {
        if (error) throw error;
    
        for(var i = 0; i < response.length; i++) {
            console.log("ID: " + response[i].item_id + "|" + 
                        "Product: " + response[i].product_name + "|" + 
                        "Department: " + response[i].department_name + "|" + 
                        "Price: " + response[i].price + "|" + 
                        "Quantity: " + response[i].stock_quantity +
                        "\n===================================================================================");
        }

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

            for(var i = 0; i < response.length; i++) {
                if(response[i].item_id === parseInt(answer.id))
                    getStock(parseInt(answer.id), answer.units);
            }
        });
    });
}

function getStock(itemID, units) {
    connection.query("SELECT * FROM products WHERE ?", { 
        item_id: itemID
    }, function(error, response) {
        if (error) throw error;
        
        if(response[0].stock_quantity <= 0) {
            console.log("Insufficient quantity!");
            restart();
        }
        
        else 
            setQuantity(itemID, units);
    });
}

function getCost(itemID, units) {
    connection.query("SELECT * FROM products WHERE ?", { 
        item_id: itemID
    }, function(error, response) {
        if (error) throw error;

        var totalCost = response[0].price * units;
        console.log("Total cost since you bought " + units  +  " " + "each at $" + response[0].price + 
                    " " + "is $" + totalCost);
        
        restart();
    });
}    

function setQuantity(itemID, units) {
    connection.query("SELECT * FROM products WHERE ?", { 
        item_id: itemID
    }, function(error, response) {
        if (error) throw error;

    var newQuantity = response[0].stock_quantity - units;

    if(newQuantity < 0)
        newQuantity = 0;
                
    connection.query("UPDATE products SET ? WHERE ?", [{
    stock_quantity: newQuantity
    }, {
        item_id: itemID
    }], function(error, response) {});

        getCost(itemID, units);
    });
}

function restart() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Do you want to purchase another item?",
            name: "confirm",
            default: true
        }
    ]).then(function(answer) {
        if(answer.confirm)
            start();
    });
}

// Initial call to begin the program
start();