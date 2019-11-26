CREATE TABLE Lists (
    ID varchar(100),
    Title varchar(200),
    Category varchar(200),
    Description varchar(1000),
    ImageURL varchar(100),
    Created_At varchar(20),
    Updated_At varchar(20),
    Items [],
);

-- export class List {
--   constructor(
--       public ListID: number,
--       public Title: string,
--       public Category: string,
--       public Description: number,
--       public ImageURL: number,
--       public Created: Date,
--       public Updated: Date,
--       public Items: Array<ListItem>,
--   ) {}
-- }
-- export class ListItem {
--   constructor(
--       public ListID: number,
--       public ListItemID: number,
--       public Title: string,
--       public Description: number,
--       public ImageURL: number,
--       public Created: Date,
--       public Updated: Date,
--   ) {}
-- }
