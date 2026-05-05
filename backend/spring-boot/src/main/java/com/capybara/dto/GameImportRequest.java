package com.capybara.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class GameImportRequest {

    @NotBlank(message = "platform is required")
    @Pattern(regexp = "lichess|chess\\.com", message = "platform must be 'lichess' or 'chess.com'")
    private String platform;

    @NotBlank(message = "username is required")
    @Size(min = 2, max = 50, message = "username must be between 2 and 50 characters")
    @Pattern(regexp = "[a-zA-Z0-9_-]+", message = "username may only contain letters, numbers, hyphens, and underscores")
    private String username;

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
