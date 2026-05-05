package com.capybara.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.capybara.model.StudyPlan;

public interface StudyRepository extends JpaRepository<StudyPlan, Integer> {
    Optional<StudyPlan> findByUserUsername(String username);
}
