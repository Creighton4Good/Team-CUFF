package cuff.cuff_springboot.service;
import cuff.cuff_springboot.entity.User;
import java.util.List;


public interface UserService {
    User createUser (User user);
    void deleteUser(Integer id);
    User getUserById(Integer id);
    List<User> getAllUsers();

}

