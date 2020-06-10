DROP TABLE IF EXISTS RecipeIngredient;
DROP TABLE IF EXISTS RecipeInstruction;
DROP TABLE IF EXISTS Recipe;
DROP TABLE IF EXISTS Ingredient;
DROP TABLE IF EXISTS Measure;
	
create table Recipe (
	RecipeID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	Name VARCHAR(100), 
    Image VARCHAR(2083),
    Source VARCHAR(50),
    Url VARCHAR(2083),
    Yield INT,
    Calories FLOAT)
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

create table RecipeInstruction (
	RecipeInstructionID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	RecipeID INT NOT NULL, 
    Step INT NOT NULL,
	Instruction VARCHAR(100) NOT NULL, 
	CONSTRAINT fk_recipeInstruction FOREIGN KEY(RecipeID) REFERENCES Recipe(RecipeID))
	ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 
    
-- TEST DATA

INSERT INTO Measure (Name) VALUES('CUP'), ('TEASPOON'), ('TABLESPOON'), ('PINCH'), ('');

INSERT INTO Ingredient (Name) VALUES('soy sauce'), ('salt'), ('sherry'), ('chocolate'), ('vanilla extract'), ('flour');

SELECT * FROM recipe where RecipeID = 1;
SELECT * FROM recipeingredient where RecipeID = 1;
SELECT * FROM recipeinstruction where RecipeID = 1;

-- DELETE from recipe where recipeId = 2

-- TEST RECIPE --
-- INSERT INTO Recipe (Name, Image, Source, Url, Yield, Calories) VALUES('Cook The Book: Chopped Ham Salad With Hard Boiled Eggs', 'https://www.edamam.com/web-img/b67/b678b3b88698d63e94cc690561c5bf33.jpg', 'Serious Eats', 'http://www.seriouseats.com/recipes/2010/08/chopped-ham-salad-with-hard-boiled-eggs-recipe.html', 3, 1716.5924330206203);

-- INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount) VALUES (1, 1, 1, 1);
-- INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (1, 1, 2, 3);
-- INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (1, 2, 2, 1);
-- INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (1, 3, 1, 2);
-- INSERT INTO RecipeIngredient (RecipeID, IngredientID, MeasureID, Amount)  VALUES (1, 4, 1, 1);

-- INSERT INTO RecipeInstruction (RecipeID, Step, Instruction)  VALUES (1, 1, 'Take this and put it on that 1');
-- INSERT INTO RecipeInstruction (RecipeID, Step, Instruction)  VALUES (1, 2, 'Take this and put it on that 2');
-- INSERT INTO RecipeInstruction (RecipeID, Step, Instruction)  VALUES (1, 3, 'Take this and put it on that 3');
-- INSERT INTO RecipeInstruction (RecipeID, Step, Instruction)  VALUES (1, 4, 'Take this and put it on that 4');
-- INSERT INTO RecipeInstruction (RecipeID, Step, Instruction)  VALUES (1, 5, 'Take this and put it on that 5');

-- SELECT RecipeID,
-- 	   Name AS 'Recipe',
-- 	   Description,
-- 	   Instructions,
-- 	   (SELECT RecipeIngredientID,
-- 			   IngredientID,
--                MeasureID,
--                Amount
-- 		FROM recipeingredient
--         WHERE RecipeID = 1) AS LIST
-- FROM recipe
-- WHERE RecipeID = 1;
-- 					
--        
--        

-- SELECT r.Name AS 'Recipe', 
-- 	r.Instructions, 
-- 	ri.Amount AS 'Amount', 
-- 	mu.Name AS 'Unit of Measure', 
-- 	i.Name AS 'Ingredient' 
-- FROM Recipe r 
-- JOIN RecipeIngredient ri on r.RecipeID = ri.RecipeID
-- JOIN Ingredient i on i.IngredientID = ri.IngredientID
-- LEFT OUTER JOIN Measure mu on mu.MeasureID = ri.MeasureID
-- WHERE r.RecipeID = 1

