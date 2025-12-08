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

    @PostMapping
    public Post createPost(@RequestBody Post post) { // to create a post
        return postService.createPost(post);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Integer id) { //to delete a post by its ID
        postService.deletePost(id);
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts(); //to get all post
    }

    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Integer id) { //get a post by its ID
        return postService.getPostById(id);
    }
}
