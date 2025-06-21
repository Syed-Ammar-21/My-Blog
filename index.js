import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsFilePath = path.join(__dirname, "post.json");

// In-memory data store
let posts = [];

let lastId = 0;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

function readPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function savePosts(posts) {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
}


//Write your code here//

//CHALLENGE 1: GET All posts
app.get("/posts", (req, res) => 
{
const posts = readPosts(); 
res.json(posts);
});


//CHALLENGE 2: GET a specific post by id
app.get("/posts/:id", (req, res) => 
{
const posts = readPosts(); 
const post = posts.find((p) => p.id === parseInt(req.params.id));
if(!post) return res.status(404).json({message: "Post not found."});
res.json(post);
});

//CHALLENGE 3: POST a new post
app.post("/posts", (req, res) => {
  const posts = readPosts();  // read from file

  // find highest id in posts or 0 if empty
  const lastId = posts.length ? Math.max(...posts.map(p => p.id)) : 0;

  const newId = lastId + 1;
  const post = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date(),
  };

  posts.push(post);          // add new post
  savePosts(posts);          // save to file

  res.status(201).json(post);
});


//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", (req, res) => {
  const posts = readPosts();                    // read posts from file
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (req.body.title) post.title = req.body.title;
  if (req.body.content) post.content = req.body.content;
  if (req.body.author) post.author = req.body.author;

  savePosts(posts);                             // save updated posts to file
  res.json(post);
});


//CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete("/posts/:id", (req, res) => {
  let posts = readPosts();                    // read posts from file
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Post not found" });

  posts.splice(index, 1);                      // remove post

  // Reset IDs to be continuous starting from 1
  posts = posts.map((post, idx) => ({
    ...post,
    id: idx + 1,
  }));

  savePosts(posts);                            // save updated posts to file

  res.json({ message: "Post deleted and IDs reset", posts });
});



app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
