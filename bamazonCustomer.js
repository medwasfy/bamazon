var mysql = require("mysql");
var inquirer = require("inquirer");
var prompt = require("prompt");
var colors = require("colors");
var Table = require("cli-table");

var connection = mysql.createConnection({
  host: "localhost",


  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
});

// start app after connection
start();

// ============================= FUNCTIONS ========================= //

function start() {
    // create new table
    var updateTable = new Table({
        head: ["Product Id", "Product Name", "Price", "Stock Quantity"],
        colWidths: [10, 40, 10, 10]
    });
    // selects all data from products table
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // (ID, product, price, stock) of all items for sale
        console.log("ITEMS FOR SALE");
        for (var i = 0; i < res.length; i++) {
            // variables to store column data
            var prodId = res[i].item_id;
            var prodName = res[i].product_name;
            var price = res[i].price;
            var quant = res[i].stock_quantity;
            // push column data into table for each product
            updateTable.push(
                [prodId, prodName, price, quant]
            );
        }
        // print table to console
        console.log(updateTable.toString());
        // runs callback function to purchase items
        buyProduct();
    });
}

// function to purchase items
function buyProduct() {
    // prompts 
    inquirer.prompt([{
        name: "product_id",
        message: "Enter the ID of the product you'd like to buy."
    }, {
        name: "quantity",
        message: "How many of the product you selected would you like to buy?"

    }]).then(function(answers) {

        connection.query("SELECT stock_quantity FROM products WHERE item_id = ?", [answers.product_id], function(err, res) {
            // check stock
            if (answers.quantity > res[0].stock_quantity) {
                console.log("Insufficient quantity!");

                // restart pruchase process
                buyProduct();
            } else {
                // check stock
                var newQty = res[0].stock_quantity - answers.quantity;
                // select info from products about product specified by user
                connection.query("SELECT * FROM products WHERE item_id = ?", [answers.product_id], function(err, res) {
                    // set product, price, and sales equal to variables
                    var prodSelected = res[0].product_name;
                    var price = res[0].price;
                    var prodSales = parseFloat(res[0].product_sales);
                    var department = res[0].department_name;
                    // total price is price of 1 item * quantity purchased
                    var total = parseFloat(price * answers.quantity);
                    // new product sales figure is old product sales plus new sales
                    var newProdSales = prodSales + total;
                    //update departments table with new product sales
                    connection.query("SELECT total_sales FROM departments WHERE department_name = ?", [department], function(err, res) {
                        // represents previous department sales
                        var dptSales = parseFloat(res[0].total_sales);
                        // adds new sale to previous department sales
                        var newDptSales = dptSales + total;
                        // updates total sales
                        connection.query("UPDATE departments SET ? WHERE ?", [{
                            total_sales: newDptSales
                        }, {
                            department_name: department
                        }], function(err, res) {
                            if (err) throw err;
                        });
                    });
                    // update product table with new quantity and product sales
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: newQty,
                        product_sales: newProdSales
                    }, {
                        item_id: answers.product_id
                    }], function(err, res) {
                        if (err) throw err;
                        // let user know of their success in purchasing their items
                        console.log("\nSuccess, you've purchased " + answers.quantity + " of " + prodSelected + " for the price of $" + total + ".\n");
                        // restarts function to buy items
                        start();
                    });
                });
            }
        });
    });
}