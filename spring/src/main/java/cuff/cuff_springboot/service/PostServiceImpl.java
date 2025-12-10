package cuff.cuff_springboot.service;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cuff.cuff_springboot.entity.Post;
import cuff.cuff_springboot.entity.User;
import cuff.cuff_springboot.repository.PostRepository;
import cuff.cuff_springboot.repository.UserRepository;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Post createPost(Post post) {
        User user = userRepository.findById(post.getUserId()).orElse(null); //admin only posting
        if (user == null || user.getIsAdmin() == null || !user.getIsAdmin()) {
        throw new RuntimeException("Only administrators can create posts.");
        }
        Post saved = postRepository.save(post);

         notificationService.notifyAllUsersOfNewPost(
            saved.getId(),
            "New post: " + saved.getTitle()
        );

        return saved;
    }

    @Override
    public void deletePost(Integer id) {
        postRepository.deleteById(id);
    }

    @Override
    public Post getPostById(Integer id) {
    return postRepository.findById(id).orElse(null);
}

    @Override
    public List<Post> getAllPosts() {
    return postRepository.findAll();
}

}
    

