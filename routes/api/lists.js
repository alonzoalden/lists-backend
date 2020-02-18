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
            if (category) {
                if (!category.Lists) {
                    category.Lists = [list];
                }
                else {
                    category.Lists.push(list);
                }
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
        const dbResponseLists = await db.query(
            `SELECT * FROM "ListItems"
            WHERE "ListID" = ($1)`,
            [req.params.id]
        )
        if (dbResponseLists.err) next(dbResponseLists.err);
        
        res.json(dbResponseLists.data.rows);
    }
    catch(e) {
        console.log(e);
    }
});

const createCategory = async (req) => {
    if (!req.body.CategoryID) {

        // If there's no Category title, give it a title of 'None'
        if (!req.body.CategoryTitle) {
            req.body.CategoryTitle = 'None';
        }

        // If user Manually types in 'None', be sure to select the proper None category so we don't add a new category
        if (req.body.CategoryTitle && req.body.CategoryTitle.toLowerCase() === 'none') {
            dbCategoryAddResponse = await db.query(
                `Select "CategoryID", "Title"
                FROM "Categories"
                WHERE "Title" = 'None'`)
            if (dbCategoryAddResponse.err) next(err);

            // If none Category doesn't exist, create it
            if (!dbCategoryAddResponse.data.rows.length) {
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
        
        // Add the new category
        else {
            dbCategoryAddResponse = await db.query(
                `INSERT INTO "Categories" ("Title")
                VALUES($1)
                RETURNING *`,
                [
                    req.body.CategoryTitle
                ])
            if (dbCategoryAddResponse.err) next(err);
        }
        return dbCategoryAddResponse.data.rows[0];
    }
}

const addListItems = async (req, id) => {
    const sqlItems = req.body.Items.map(item => {
        return [
            id
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

    const dbListItemsResponse = await db.query(sql + 'RETURNING *');
    if (dbListItemsResponse.err) next(err);
    return dbListItemsResponse.data.rows;
}

// add new list
router.post('/lists', async (req, res, next) => {
    try {
        let dbCategoryAddResponse;
        if (!req.body.CategoryID) {
            dbCategoryAddResponse = await createCategory(req);
        }
        // This creates a new List
        const dbListResponse = await db.query(
            `INSERT INTO "Lists" ("Title", "CategoryID", "CategoryTitle", "Description", "ImageURL", "Created_At", "Updated_At")
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                req.body.Title,
                dbCategoryAddResponse && dbCategoryAddResponse.CategoryID || req.body.CategoryID,
                dbCategoryAddResponse && dbCategoryAddResponse.Title || req.body.CategoryTitle,
                req.body.Description,
                req.body.ImageURL,
                req.body.Created,
                req.body.Updated
            ])
        if (dbListResponse.err) next(err);
        
        let itemsResponse;
        if (req.body.Items) {
            itemsResponse = await addListItems(req, dbListResponse.data.rows[0].ListID);
        }

        const responseBody = {
            ListID: dbListResponse.data.rows[0].ListID,
            CategoryID: dbListResponse.data.rows[0].CategoryID,
            Title: dbListResponse.data.rows[0].Title,
            CategoryTitle: dbListResponse.data.rows[0].CategoryTitle,
            Description: dbListResponse.data.rows[0].Description,
            ImageURL: dbListResponse.data.rows[0].ImageURL,
            Created_At: dbListResponse.data.rows[0].Created_At,
            Updated_At: dbListResponse.data.rows[0].Updated_At,
            Items: itemsResponse
        }

        return res.status(200).send(responseBody);
    }
    catch(e) {
        console.log(e);
    }
});

// update list item
router.put('/lists/:id', async (req, res, next) => {
    try {
        let dbCategoryAddResponse;
        if (!req.body.CategoryID) {
            dbCategoryAddResponse = await createCategory(req);
        }
        const dbResponseList = await db.query(
            `UPDATE "Lists" 
            SET "Title"=($2), "CategoryID"=($3), "CategoryTitle"=($4), "Description"=($5), "ImageURL"=($6)
            WHERE "ListID"=($1)
            RETURNING *`,
            [
                req.params.id,
                req.body.Title,
                dbCategoryAddResponse && dbCategoryAddResponse.CategoryID || req.body.CategoryID,
                dbCategoryAddResponse && dbCategoryAddResponse.Title || req.body.CategoryTitle,
                req.body.Description,
                req.body.ImageURL
            ]
        )
        if (dbResponseList.err) next(dbResponseList.err);
        //removing all lists items
        const dbResponseDeleteListItems = await db.query(
            `DELETE FROM "ListItems" WHERE "ListID"=($1)`,
            [req.params.id]
        )
        if (dbResponseDeleteListItems.err) next(dbResponseDeleteListItems.err);
        
        let itemsResponse;
        if (req.body.Items) {
            itemsResponse = await addListItems(req, req.body.ListID);
        }

        const responseBody = {
            ListID: dbResponseList.data.rows[0].ListID,
            CategoryID: dbResponseList.data.rows[0].CategoryID,
            Title: dbResponseList.data.rows[0].Title,
            CategoryTitle: dbResponseList.data.rows[0].CategoryTitle,
            Description: dbResponseList.data.rows[0].Description,
            ImageURL: dbResponseList.data.rows[0].ImageURL,
            Created_At: dbResponseList.data.rows[0].Created_At,
            Updated_At: dbResponseList.data.rows[0].Updated_At,
            Items: itemsResponse
        }

        return res.status(200).send(responseBody);
    }
    catch(e) {
        console.log(e);
    }
});

// delete list
router.delete('/list/:id', async (req, res, next) => {
    try {
        const dbResponseList = await db.query(
            `DELETE FROM "Lists" WHERE "ListID"=($1)`,
            [req.params.id]
            )
        if (dbResponseList.err) next(dbResponseLists.err);
        return res.status(200).send({});
    }
    catch(e) {
        console.log(e);
    }
});

module.exports = router;