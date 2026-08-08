package com.employee.system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.system.entity.ConnectionRequest;
import com.employee.system.entity.Notification;
import com.employee.system.entity.Post;
import com.employee.system.entity.PostComment;
import com.employee.system.entity.User;
import com.employee.system.repository.UserRepository;
import com.employee.system.service.SocialFeedService;

@RestController
@CrossOrigin(origins = "*")
public class SocialFeedController {

    private final SocialFeedService feedService;
    private final UserRepository userRepository;

    public SocialFeedController(SocialFeedService feedService, UserRepository userRepository) {
        this.feedService = feedService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext() == null || SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) return null;
        return userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);
    }

    @GetMapping("/api/feed")
    public ResponseEntity<List<Post>> getFeed() {
        User current = getCurrentUser();
        return ResponseEntity.ok(feedService.getFeedPosts(current));
    }

    @GetMapping("/api/feed/my-posts")
    public ResponseEntity<List<Post>> getMyPosts() {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(feedService.getMyPosts(current));
    }

    @PostMapping("/api/feed/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String content = payload.get("content");
        String postType = payload.getOrDefault("postType", "TEXT");
        String mediaUrl = payload.get("mediaUrl");
        String visibility = payload.getOrDefault("visibility", "PUBLIC");

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post content cannot be empty"));
        }

        Post post = feedService.createPost(current, content, postType, mediaUrl, visibility);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PostMapping("/api/feed/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Post post = feedService.toggleLike(id, current);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/api/feed/posts/{id}/share")
    public ResponseEntity<?> sharePost(@PathVariable Long id) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Post post = feedService.sharePost(id, current);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/api/feed/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String content = (String) payload.get("content");
        Long parentCommentId = payload.get("parentCommentId") != null ? ((Number) payload.get("parentCommentId")).longValue() : null;

        PostComment comment = feedService.addComment(id, current, content, parentCommentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/api/feed/posts/{id}/comments")
    public ResponseEntity<List<PostComment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(feedService.getCommentsForPost(id));
    }

    @PostMapping("/api/network/connect/{userId}")
    public ResponseEntity<?> sendConnectionRequest(@PathVariable Long userId) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        ConnectionRequest req = feedService.sendConnectionRequest(current, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(req);
    }

    @PostMapping("/api/network/requests/{id}/respond")
    public ResponseEntity<?> respondToRequest(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String status = payload.getOrDefault("status", "ACCEPTED");
        ConnectionRequest req = feedService.respondToConnectionRequest(id, status, current);
        return ResponseEntity.ok(req);
    }

    @PostMapping("/api/network/follow/{userId}")
    public ResponseEntity<?> toggleFollow(@PathVariable Long userId) {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Map<String, Object> result = feedService.toggleFollow(current, userId);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/network/requests")
    public ResponseEntity<List<ConnectionRequest>> getPendingRequests() {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(feedService.getPendingConnectionRequests(current));
    }

    @GetMapping("/api/notifications")
    public ResponseEntity<List<Notification>> getNotifications() {
        User current = getCurrentUser();
        if (current == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(feedService.getNotifications(current));
    }
}
