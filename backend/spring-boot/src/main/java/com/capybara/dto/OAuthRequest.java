package com.capybara.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class OAuthRequest {
    private String provider;
    private String providerId;
    private String email;
    private String username;

    @JsonCreator
    public OAuthRequest(
            @JsonProperty("provider") String provider,
            @JsonProperty("providerId") String providerId,
            @JsonProperty("email") String email,
            @JsonProperty("username") String username) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.username = username;
    }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
