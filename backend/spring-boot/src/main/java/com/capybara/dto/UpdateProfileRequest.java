package com.capybara.dto;

public class UpdateProfileRequest {
    private String chessComUsername;
    private String liChessUsername;

    public String getChessComUsername() { return chessComUsername; }
    public void setChessComUsername(String chessComUsername) { this.chessComUsername = chessComUsername; }
    public String getLiChessUsername() { return liChessUsername; }
    public void setLiChessUsername(String liChessUsername) { this.liChessUsername = liChessUsername; }
}
