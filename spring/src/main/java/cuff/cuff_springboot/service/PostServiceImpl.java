package cuff.cuff_springboot.service;
import cuff.cuff_springboot.entity.Post;
import cuff.cuff_springboot.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Override
    public Post createPost(Post post) {
        return postRepository.save(post);
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
    

