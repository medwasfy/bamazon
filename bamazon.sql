DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INTEGER (10) AUTO_INCREMENT NOT NULL,
	product_name VARCHAR (250) NOT NULL,
	department_name VARCHAR (250),
	price DECIMAL(10,2) NOT NULL,
	stock_quantity INTEGER (10) NOT NULL,
	product_sales DECIMAL (10,2) DEFAULT 0.00,
	PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Binder", "Office Supplies", "12.00", "50", "0.00"),
	   ("George Foreman Griddle", "Household Items", "15.00", "100", "0.00"),
	   ("Puzzle Game", "Toys and Games", "9.00", "25", "0.00"),
	   ("Water Bottles (pkg. of 25)", "Groceries", "32.00", "75", "0.00"),
	   ("Vacuum Cleaner", "Household Items", "340.00", "14", "0.00"),
	   ("Maroon 5 CD", "Media", "19.99", "87", "0.00"),
	   ("Coffee", "Groceries", "7.50", "111", "0.00"),
	   ("Sharpie", "Office Supplies", "2.50", "200", "0.00"),
	   ("Play Station", "Toys and Games", "13.50", "26", "0.00"),
	   ("Ninja Blender", "Household Items", "139.99", "19", "0.00");

CREATE TABLE departments (
	department_id INTEGER (10) AUTO_INCREMENT NOT NULL,
	department_name VARCHAR (250) NOT NULL,
	over_head_costs DECIMAL (10,2) NOT NULL,
	total_sales DECIMAL (10,2),
	PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs, total_sales)
VALUES ("Office Supplies", "100.50", "0.00"),
	   ("Household Items", "60.00", "0.00"),
	   ("Toys and Games", "50.00", "0.00"),
	   ("Groceries", "80.00", "0.00"),
	   ("Media", "66.00", "0.00");


SELECT * FROM products;

