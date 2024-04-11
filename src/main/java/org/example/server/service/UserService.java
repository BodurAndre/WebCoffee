package org.example.server.service;

import org.example.server.models.User;
import org.example.server.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public void updateUserRole(String email, String role) {
        User user = userRepository.findUserByEmail(email);
        if (user != null) {
            user.setRole(role);
            userRepository.save(user);
        }
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        return userRepository.findUserByEmail(userName);
    }

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }
    public List<User> listUser() {
        return userRepository.findAll();
    }

    public User createUser(User user){
        User newUser = userRepository.save(user);
        userRepository.flush();
        return newUser;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
