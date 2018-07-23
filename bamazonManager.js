
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

//start app after connection
start();

// =============================== FUNCTIONS =============================== //

function start() {
    inquirer.prompt([{
        name: "action",
        message: "Select an action.",
        type: "list",
        choices: ["View Product Sales by Department", "View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }]).then(function(answers) {
        if (answers.action === "View Product Sales by Department") {
            viewDptSales();
        } else if (answers.action === "View Products for Sale") {
            viewProd();
        } else if (answers.action === "View Low Inventory") {
            viewLow();
        } else if (answers.action === "Add to Inventory") {
            // create an array of current products
            var products = [];
            connection.query("SELECT product_name FROM products", function(err, res) {
                for (h = 0; h < res.length; h++) {
                    products.push(res[h].product_name);
                }
                // run add inventory function
                addInv(products);
            });
        } else if (answers.action === "Add New Product") {
            addProd();
        }
    });
}

function viewDptSales() {
    // create new table
    var salesTable = new Table({
        head: ["Id", "Department Name", "Overhead", "Total Sales", "Total Profit"],
        colWidths: [5, 20, 15, 15, 15]
    });
    // select info from departments table
    connection.query("SELECT * FROM departments", function(err, res) {
        for (var i = 0; i < res.length; i++) {
            // variables to store column data
            var deptId = res[i].department_id;
            var deptName = res[i].department_name;
            var overhead = res[i].over_head_costs;
            var totalSales = res[i].total_sales;
            var totalProfit = (Math.round((totalSales - overhead) * 100)) / 100;
            // push column data into table for each department
            salesTable.push(
                [deptId, deptName, overhead, totalSales, totalProfit]
            );
        }
        // print table to console
        console.log(salesTable.toString());
        // restart app
        start();
    });
}


function viewProd() {
    // create new table
    var productTable = new Table({
        head: ["Id", "Product Name", "Price", "Qty.", "Dept."],
        colWidths: [5, 35, 10, 10, 20]
    });
    // select all data from products table
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.log("ALL PRODUCTS");
        // log info for all products in database
        for (var i = 0; i < res.length; i++) {
            var prodId = res[i].item_id;
            var prodName = res[i].product_name;
            var price = res[i].price;
            var stock = res[i].stock_quantity;
            var sales = res[i].department_name;
            productTable.push(
                [prodId, prodName, price, stock, sales]
            );
        }
        // print table to console
        console.log(productTable.toString());
        // re-initilize app
        start();
    });
}

function viewLow() {
    var lowInvTable = new Table({
        head: ["Id", "Product Name", "Qty."],
        colWidths: [5, 35, 10]
    });
    // selects all data from products where stock quantity is < 5
    connection.query("SELECT * FROM products WHERE stock_quantity < ?", [5], function(err, res) {
        if (err) throw err;
        // if there is at least 1 result, display info for product(s)
        if (res.length > 0) {
            console.log("\nLOW INVENTORY");
            for (var j = 0; j < res.length; j++) {
                // variables to store column data
                var prodId = res[j].item_id;
                var prodName = res[j].product_name;
                var qty = res[j].stock_quantity;
                // push column data into table for each product
                lowInvTable.push(
                    [prodId, prodName, qty]
                );
            }
            // print table to console
            console.log(lowInvTable.toString());
            // if there are no results, let user know
        } else {
            console.log("\nThere are no low inventory items!\n");
        }
        // re-start app
        start();
    });
}

function addInv(array) {
    // ask user info to add inventory
    inquirer.prompt([{
        name: "item",
        message: "Which item would you like to add inventory to?",
        type: "list",
        choices: array
    }, {
        name: "amount",
        message: "How many more units would you like to add?"
    }]).then(function(answers) {
        // select the stock qty from products for product user specified above
        connection.query("SELECT stock_quantity FROM products WHERE product_name = ?", [answers.item], function(err, res) {
            // add previous amount and amount being added
            var stockQty = parseInt(answers.amount) + parseInt(res[0].stock_quantity);
            // update table with new stock quantity
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: stockQty
            }, {
                product_name: answers.item
            }], function(err, res) {
                if (err) {
                    throw err;
                } else {
                    // let user know the stock quantity has been updated
                    console.log("The inventory for " + answers.item + " is now " + stockQty + " units.\n");
                }
                //re-start app
                start();
            });
        });
    });
}

function addProd() {
    connection.query("SELECT department_name FROM departments", function(err, res) {
        var departments = [];
        for (var k = 0; k < res.length; k++) {
            departments.push(res[k].department_name);
        }
        // ask user info about new product
        inquirer.prompt([{
            name: "product",
            message: "Enter name of product you would like to add."
        }, {
            name: "price",
            message: "Enter price of product to be added."
        }, {
            name: "quantity",
            message: "Enter quantity of product to be added."
        }, {
            name: "department",
            message: "Select the department of product to be added.",
            type: "list",
            choices: departments
        }]).then(function(answers) {
            // product info variables
            var product = answers.product;
            var price = answers.price;
            var quantity = answers.quantity;
            var department = answers.department;
            // make sure user wants to add their product
            inquirer.prompt([{
                name: "validation",
                message: "Are you sure you want to add " + answers.product + " to the store?",
                type: "list",
                choices: ["Yes", "No"]
            }]).then(function(answers) {
                // if yes, insert product and info into products table
                if (answers.validation === "Yes") {
                    connection.query("INSERT INTO products SET ?", {
                        product_name: product,
                        price: price,
                        department_name: department,
                        stock_quantity: quantity,
                        product_sales: 0.00
                    }, function(err, res) {
                        if (err) {
                            throw err;
                        } else {
                            console.log("\nYour item has been added.\n");
                            //re-start app
                            start();
                        }
                    });
                    // if no, let user know product has not been added
                } else {
                    console.log("\nYour item has not been added.\n");
                    //re-start app
                    start();
                }
            });
        });
    });
}