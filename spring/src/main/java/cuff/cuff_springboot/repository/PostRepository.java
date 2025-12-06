package cuff.cuff_springboot.repository;
import cuff.cuff_springboot.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository <Post, Integer> {
    
}

