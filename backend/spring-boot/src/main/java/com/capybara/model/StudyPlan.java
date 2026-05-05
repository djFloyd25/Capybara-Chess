package com.capybara.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_plans")
public class StudyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String rawGamesJson;

    @Column(columnDefinition = "TEXT")
    private String planJson;

    private String platform;
    private String importedUsername;

    private LocalDateTime generatedAt;
    private LocalDateTime updatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRawGamesJson() { return rawGamesJson; }
    public void setRawGamesJson(String rawGamesJson) { this.rawGamesJson = rawGamesJson; }

    public String getPlanJson() { return planJson; }
    public void setPlanJson(String planJson) { this.planJson = planJson; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getImportedUsername() { return importedUsername; }
    public void setImportedUsername(String importedUsername) { this.importedUsername = importedUsername; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
