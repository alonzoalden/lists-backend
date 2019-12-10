CREATE TABLE "Categories" (
    "CategoryID" SERIAL PRIMARY KEY,
    "Title" varchar(200) UNIQUE,
    "Category" varchar(200),
    "Description" varchar(1000),
    "ImageURL" varchar(120),
    "Created_At" varchar(20),
    "Updated_At" varchar(20)
);

CREATE TABLE "Lists" (
    "ListID" SERIAL PRIMARY KEY,
    "CategoryID" int,
    "Title" varchar(200),
    "CategoryTitle" varchar(200),
    "Description" varchar(1000),
    "ImageURL" varchar(120),
    "Created_At" varchar(20),
    "Updated_At" varchar(20),
    FOREIGN KEY ("CategoryID") REFERENCES "Categories"("CategoryID") ON DELETE cascade
);

CREATE TABLE "ListItems" (
    "ListItemID" SERIAL PRIMARY KEY ,
    "ListID" int NOT NULL,
    "Title" varchar(200),
    "Description" varchar(1000),
    "ImageURL" varchar(120),
    "Created_At" varchar(20),
    "Updated_At" varchar(20),
    FOREIGN KEY ("ListID") REFERENCES "Lists"("ListID") ON DELETE cascade
);
