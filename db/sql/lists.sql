CREATE TABLE Lists (
    ListID SERIAL PRIMARY KEY,
    Title varchar(200),
    Category varchar(200),
    Description varchar(1000),
    ImageURL varchar(120),
    Created_At varchar(20),
    Updated_At varchar(20)
);

CREATE TABLE ListItems (
    ListItemID SERIAL,
    ListID int NOT NULL,
    Title varchar(200),
    Description varchar(1000),
    ImageURL varchar(120),
    Created_At varchar(20),
    Updated_At varchar(20),
    PRIMARY KEY (ListItemID),
    FOREIGN KEY (ListID) REFERENCES Lists(ListID)
);
