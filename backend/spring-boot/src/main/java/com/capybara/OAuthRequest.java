package com.capybara;

public class OAuthRequest {
    private String provider;
    private String providerId;
    private String email;
    private String username;

    public OAuthRequest(String provider, String providerId, String email, String username) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.username = username;
    }

    // Getters and Setters
    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
