package cuff.cuff_springboot.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "metric_type", nullable = false)
    private String metricType;   

    @Column(name = "post_id")
    private Integer postId;      //fk

    @Column(name = "user_id")
    private Integer userId;      //fk

    @Column(name = "location")
    private String location;     

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;     

    public Analytics() {}

    public Analytics(String metricType, Integer postId, Integer userId, String location,
                     LocalDateTime timestamp, String metadata) {
        this.metricType = metricType;
        this.postId = postId;
        this.userId = userId;
        this.location = location;
        this.timestamp = timestamp;
        this.metadata = metadata;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getMetricType() {
        return metricType;
    }

    public void setMetricType(String metricType) {
        this.metricType = metricType;
    }

    public Integer getPostId() {
        return postId;
    }

    public void setPostId(Integer postId) {
        this.postId = postId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

}
