package cuff.cuff_springboot.service;
import cuff.cuff_springboot.entity.Post;
import java.util.List;


public interface PostService {
    Post createPost (Post post);
    void deletePost (Integer id);
    Post getPostById(Integer id);
    List<Post> getAllPosts();

}
