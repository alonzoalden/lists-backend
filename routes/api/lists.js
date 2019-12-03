const Http = require('../../agent.js');
const router = require('express').Router();
const db = require('../../db');
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
                        req.body.CategoryTitle,
                    ])
                if (dbCategoryAddResponse.err) next(err);
            }
        }

        // This creates a new List
        const dbResponse = await db.query(
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
            if (dbResponse.err) next(err);
            res.status(200).send({})
            
        }
    catch(e) {
        console.log(e);
    }
});

module.exports = router;