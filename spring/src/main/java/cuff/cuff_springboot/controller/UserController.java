package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.User;
import cuff.cuff_springboot.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public User createUser(@RequestBody User user) { // to create a user
        return userService.createUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id) { // to delete a user by ID
        userService.deleteUser(id);
    }

    @GetMapping
    public List<User> getAllUsers() { // to get all users
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Integer id) { // get user by ID
        return userService.getUserById(id);
    }
}
