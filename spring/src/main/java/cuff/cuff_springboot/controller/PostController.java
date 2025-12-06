package cuff.cuff_springboot.controller;
import cuff.cuff_springboot.entity.Post;
import cuff.cuff_springboot.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    // CREATE
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return postService.createPost(post);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Integer id) {
        postService.deletePost(id);
    }

    // ⭐ GET ALL POSTS
    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    // ⭐ GET POST BY ID
    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Integer id) {
        return postService.getPostById(id);
    }
}
