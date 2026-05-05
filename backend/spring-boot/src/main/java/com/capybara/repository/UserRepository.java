package com.capybara.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.capybara.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
