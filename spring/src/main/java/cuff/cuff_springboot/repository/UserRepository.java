package cuff.cuff_springboot.repository;
import cuff.cuff_springboot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository <User, Integer> {
    List<User> findByNotificationsEnabledTrue();
    Optional<User> findByEmail(String email);
}