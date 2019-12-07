const Http = require('../../agent.js');
const router = require('express').Router();
const db = require('../../db');
const format = require('pg-format');
const keys = require('../../env-config.js');

// retreive lists
router.get('/lists', async (req, res, next) => {
    try {
        const dbResponseCategories = await db.query(
            `SELECT * FROM "Categories"`
            )
        if (dbResponseCategories.err) next(dbResponseCategories.err);
        const dbResponseLists = await db.query(
            `SELECT * FROM "Lists"`
        )
        if (dbResponseLists.err) next(dbResponseLists.err);
        dbResponseLists.data.rows.forEach(list => {
            const category = dbResponseCategories.data.rows.find(category => category.CategoryID === list.CategoryID);
            if (!category.Lists) {
                category.Lists = [list];
            }
            else {
                category.Lists.push(list);
            }
        })
        res.json(dbResponseCategories.data.rows);
    }
    catch(e) {
        console.log(e);
    }
});

router.get('/list/:id', async (req, res, next) => {
    try {
        console.log(req.params.id);
        const dbResponseLists = await db.query(
            `SELECT * FROM "ListItems"
            WHERE "ListID" = ($1)`,
            [req.params.id]
        )
        if (dbResponseLists.err) next(dbResponseLists.err);
        
        console.log(dbResponseLists)
        res.json(dbResponseLists.data.rows);
    }
    catch(e) {
        console.log(e);
    }
});


// add new list
router.post('/lists', async (req, res, next) => {
    try {
        let dbCategoryAddResponse;

        // This creates a new Category
        if (!req.body.CategoryID) {

            // If user Manually types in 'None', be sure to select the proper None category so we don't add a new category
            if (req.body.CategoryTitle && req.body.CategoryTitle.toLowerCase() === 'none') {
                dbCategoryAddResponse = await db.query(
                    `Select "CategoryID", "Title"
                    FROM "Categories"
                    WHERE "Title" = 'None'`)
                if (dbCategoryAddResponse.err) next(err);
            }
            
            // Add the new category
            else {
                // If there's no title, give a title of 'None'
                if (!req.body.CategoryTitle) {
                    req.body.CategoryTitle = 'None';
                }
                dbCategoryAddResponse = await db.query(
                    `INSERT INTO "Categories" ("Title")
                    VALUES($1)
                    RETURNING *`,
                    [
                        req.body.CategoryTitle
                    ])
                if (dbCategoryAddResponse.err) next(err);
            }
        }



        // This creates a new List
        const dbListResponse = await db.query(
            `INSERT INTO "Lists" ("Title", "CategoryID", "CategoryTitle", "Description", "ImageURL", "Created_At", "Updated_At")
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                req.body.Title,
                dbCategoryAddResponse && dbCategoryAddResponse.data.rows[0].CategoryID || req.body.CategoryID,
                dbCategoryAddResponse && dbCategoryAddResponse.data.rows[0].Title || req.body.CategoryTitle,
                req.body.Description,
                req.body.ImageURL,
                req.body.Created,
                req.body.Updated
            ])
        if (dbListResponse.err) next(err);
        

        const responseBody = {
            ListID: dbListResponse.data.rows[0].ListID,
            CategoryID: dbListResponse.data.rows[0].CategoryID,
            Title: dbListResponse.data.rows[0].Title,
            CategoryTitle: dbListResponse.data.rows[0].CategoryTitle,
            Description: dbListResponse.data.rows[0].Description,
            ImageURL: dbListResponse.data.rows[0].ImageURL,
            Created_At: dbListResponse.data.rows[0].Created_At,
            Updated_At: dbListResponse.data.rows[0].Updated_At
        }

        if (req.body.Items) {
            const sqlItems = req.body.Items.map(item => {
                return [
                    dbListResponse.data.rows[0].ListID
                    , item.Title
                    , item.Description
                    , item.ImageURL
                    , item.Created
                    , item.Updated
                ];
            });
            const sql = format(
                'INSERT INTO "ListItems"("ListID", "Title", "Description", "ImageURL", "Created_At", "Updated_At") VALUES %L'
                , sqlItems);
            //console.log(sql);  // INSERT INTO t (name, age) VALUES ('a', '1'), ('b', '2')

            const dbListItemsResponse = await db.query(sql + 'RETURNING *');
            if (dbListItemsResponse.err) next(err);
            responseBody.Items = dbListItemsResponse.data.rows;
            return res.status(200).send(responseBody);
        }
        else {
            return res.status(200).send(responseBody);
        }
    }

    catch(e) {
        console.log(e);
    }
});

module.exports = router;