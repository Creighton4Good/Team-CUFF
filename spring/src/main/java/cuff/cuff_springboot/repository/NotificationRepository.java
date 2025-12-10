package cuff.cuff_springboot.repository;
import cuff.cuff_springboot.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository <Notification, Integer> {
    List<Notification> findByUserId(Integer userId);

}
    

