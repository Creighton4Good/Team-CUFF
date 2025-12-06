package cuff.cuff_springboot.repository;
import cuff.cuff_springboot.entity.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalyticsRepository extends JpaRepository <Analytics, Integer> {
    
}

