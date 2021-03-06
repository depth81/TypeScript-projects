"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
var Posts_1 = require("../models/Posts");
function getAllPosts(req, res, next) {
    Posts_1.default.find(function (err, posts) {
        if (err) {
            res.status(500).json({ err: err });
        }
        else {
            res.status(200).json({ posts: posts });
        }
        ;
    });
}
exports.getAllPosts = getAllPosts;
;
function getPostById(req, res, next) {
    var id = req.params.id;
    Posts_1.default.findById(id, function (err, post) {
        if (err) {
            res.status(500).json({ err: err });
        }
        else {
            res.status(200).json({ post: post });
        }
        ;
    });
}
exports.getPostById = getPostById;
;
function createPost(req, res, next) {
    var title = req.body.title;
    var content = req.body.content;
    if (!title) {
        res.status(422).json({ err: 'The title is required' });
        return;
    }
    ;
    if (!content) {
        res.status(422).json({ err: 'The content is required' });
        return;
    }
    ;
    var post = new Posts_1.default({
        title: title,
        content: content
    });
    post.save(function (err, post) {
        if (err) {
            res.status(500).json({ err: err });
        }
        else {
            res.status(200).json({ post: post });
        }
        ;
    });
}
exports.createPost = createPost;
;
function updatePost(req, res, next) {
    var id = req.params.id;
    Posts_1.default.findByIdAndUpdate(id, req.body, function (err, post) {
        if (err) {
            res.status(500).json({ err: err });
        }
        else {
            res.status(200).json({ post: post });
        }
        ;
    });
}
exports.updatePost = updatePost;
;
function deletePost(req, res, next) {
    var id = req.params.id;
    Posts_1.default.findByIdAndRemove(id, function (err, post) {
        if (err) {
            res.status(500).json({ err: err });
        }
        else {
            res.status(200).json({ post: post });
        }
        ;
    });
}
exports.deletePost = deletePost;
;
//# sourceMappingURL=PostController.js.map