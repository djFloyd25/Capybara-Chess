package com.capybara;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalStateException( id + " id not found"));
    }

    public void insertUser(User user) {
        userRepository.save(user);
    }

}
