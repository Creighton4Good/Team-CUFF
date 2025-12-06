package cuff.cuff_springboot.repository;
import cuff.cuff_springboot.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository <Notification, Integer> {
    
}
    

