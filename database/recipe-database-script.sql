DROP TABLE IF EXISTS RecipeIngredient;
DROP TABLE IF EXISTS Recipe;
DROP TABLE IF EXISTS Ingredient;
DROP TABLE IF EXISTS Measure;
	
create table Recipe (
	RecipeID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	Name VARCHAR(25), 
	Description VARCHAR(50), 
	Instructions VARCHAR(500)) 
	ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

create table Ingredient (
	IngredientID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	Name VARCHAR(50)) 
	ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

create table Measure (
	MeasureID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	Name VARCHAR(30)) 
	ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

create table RecipeIngredient (
	RecipeIngredientID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	RecipeID INT NOT NULL, 
	IngredientID INT NOT NULL, 
	MeasureID INT, 
	Amount INT, 
	CONSTRAINT fk_recipe FOREIGN KEY(RecipeID) REFERENCES Recipe(RecipeID), 
	CONSTRAINT fk_ingredient FOREIGN KEY(IngredientID) REFERENCES Ingredient(IngredientID), 
	CONSTRAINT fk_measure FOREIGN KEY(MeasureID) REFERENCES Measure(MeasureID)) 
	ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 
    
-- TEST DATA

INSERT INTO Measure (Name) VALUES('CUP'), ('TEASPOON'), ('TABLESPOON'), ('PINCH');

INSERT INTO Ingredient (Name) VALUES('egg'), ('salt'), ('sugar'), ('chocolate'), ('vanilla extract'), ('flour');

INSERT INTO Recipe (Name, Description, Instructions) VALUES('Boiled Egg', 'A single boiled egg', 'Add egg to cold water. Bring water to boil. Cook.');

INSERT INTO Recipe (Name, Description, Instructions) VALUES('Chocolate Cake', 'Yummy cake', 'Add eggs, flour, chocolate to pan. Bake at 350 for 1 hour');

INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount) VALUES (1, 1, NULL, 1);

INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (2, 1, NULL, 3);

INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (2, 2, 2, 1);

INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (2, 3, 1, 2);

INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (2, 4, 1, 1);

SELECT r.Name AS 'Recipe', 
	r.Instructions, 
	ri.Amount AS 'Amount', 
	mu.Name AS 'Unit of Measure', 
	i.Name AS 'Ingredient' 
FROM Recipe r 
JOIN RecipeIngredient ri on r.RecipeID = ri.RecipeID
JOIN Ingredient i on i.IngredientID = ri.IngredientID
LEFT OUTER JOIN Measure mu on mu.MeasureID = ri.MeasureID;
