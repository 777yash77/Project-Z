package com.employee.system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "HR"; // SUPER_ADMIN, ORGANISATION, HR, EMPLOYEE

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean approved = true;

    @Column(nullable = false)
    private boolean suspended = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Organization organization;

    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String coverUrl;

    private String headline;

    @Column(length = 2000)
    private String bio;

    private String phone;
    private String location;
    private String website;
    private String githubUrl;
    private String linkedinUrl;
    
    @Column(nullable = false)
    private boolean openForWork = false;

    @Column(name = "last_active_at")
    private java.time.LocalDateTime lastActiveAt;

    @jakarta.persistence.ManyToMany(fetch = FetchType.LAZY)
    @jakarta.persistence.JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "following_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.Set<User> followers = new java.util.HashSet<>();

    @jakarta.persistence.ManyToMany(mappedBy = "followers", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.Set<User> following = new java.util.HashSet<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public boolean isSuspended() { return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public boolean isOpenForWork() { return openForWork; }
    public void setOpenForWork(boolean openForWork) { this.openForWork = openForWork; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public java.time.LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(java.time.LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public java.util.Set<User> getFollowers() { return followers; }
    public void setFollowers(java.util.Set<User> followers) { this.followers = followers; }
    public java.util.Set<User> getFollowing() { return following; }
    public void setFollowing(java.util.Set<User> following) { this.following = following; }

    @jakarta.persistence.Transient
    public boolean isOnline() {
        return lastActiveAt != null && lastActiveAt.isAfter(java.time.LocalDateTime.now().minusSeconds(12));
    }

    @jakarta.persistence.Transient
    private boolean connected = false;

    @jakarta.persistence.Transient
    private boolean connectionRequested = false;

    public boolean isConnected() { return connected; }
    public void setConnected(boolean connected) { this.connected = connected; }

    public boolean isConnectionRequested() { return connectionRequested; }
    public void setConnectionRequested(boolean connectionRequested) { this.connectionRequested = connectionRequested; }
}
