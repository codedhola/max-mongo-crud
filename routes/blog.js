const express = require("express");
const { ObjectId } = require("mongodb");

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
    res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
    const posts = await db.getDb().collection("posts").find({}).toArray()  
    res.render("posts-list", { posts: posts }); 
});

router.post("/posts", async function (req, res) {
    // Get author ID
    const authorId = new ObjectId(req.body.author);

    // Get author details from the database
    const author = await db
        .getDb()
        .collection("authors")
        .findOne({ _id: authorId });

    // Create post object to be stored
    const newPost = {
        title: req.body.title,
        summary: req.body.summary,
        body: req.body.content,
        date: new Date(),
        author: {
            id: authorId,
            name: author.name,
            email: author.email,
        },
    };

    // Insert newly created post
    const result = await db.getDb().collection("posts").insertOne(newPost);

    res.redirect("/posts");
});

router.get("/new-post", async function (req, res) {
    // Access "authors" collection
    // `toArray()` will get all the authors. If not used then returns cursor (data in chunks)
    const authors = await db.getDb().collection("authors").find().toArray();

    // Passing data to the template
    res.render("create-post", { authors: authors });
});

router.get("/posts/:id", async function (req, res) {
    const postId = req.params.id;
    const details = await db.getDb().collection("posts").findOne({ _id: new ObjectId(postId)}, {summary: 1});   
    res.render("post-detail", {details: details}); 
});

router.get("/posts/:id/edit", async function(req, res) {
    const postId = req.params.id;
    const details = await db.getDb().collection("posts").findOne({_id: new ObjectId(postId)});
    res.render("update-post", { details: details});
});

router.post("/posts/:id/edit", async function (req, res) {
    const postId = new ObjectId(req.params.id);  
    const content = await db.getDb().collection("posts").updateOne({_id: postId}, { $set: {
        title: req.body.title,
        summary: req.body.summary,
        body: req.body.content
    }});
    
    res.redirect("/posts");    
   
});

router.post("/posts/:id/delete", async function (req, res) {
    const postId = new ObjectId(req.params.id);
    const content = await db.getDb().collection("posts").deleteOne({_id: postId});
    res.redirect("/posts"); 
});

module.exports = router;
