package com.employee.system.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.employee.system.entity.ConnectionRequest;
import com.employee.system.entity.Notification;
import com.employee.system.entity.Post;
import com.employee.system.entity.PostComment;
import com.employee.system.entity.PostLike;
import com.employee.system.entity.User;
import com.employee.system.repository.ConnectionRequestRepository;
import com.employee.system.repository.NotificationRepository;
import com.employee.system.repository.PostCommentRepository;
import com.employee.system.repository.PostLikeRepository;
import com.employee.system.repository.PostRepository;
import com.employee.system.repository.UserRepository;

@Service
public class SocialFeedService {

    private final PostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final PostLikeRepository likeRepository;
    private final ConnectionRequestRepository connectionRequestRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public SocialFeedService(PostRepository postRepository,
                             PostCommentRepository commentRepository,
                             PostLikeRepository likeRepository,
                             ConnectionRequestRepository connectionRequestRepository,
                             NotificationRepository notificationRepository,
                             UserRepository userRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.connectionRequestRepository = connectionRequestRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Post createPost(User author, String content, String postType, String mediaUrl, String visibility) {
        Post post = new Post();
        post.setAuthor(author);
        post.setContent(content);
        post.setPostType(postType != null ? postType : "TEXT");
        post.setMediaUrl(mediaUrl);
        post.setVisibility(visibility != null ? visibility : "PUBLIC");
        return postRepository.save(post);
    }

    public List<Post> getFeedPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Post> getMyPosts(User current) {
        return postRepository.findByAuthorOrderByCreatedAtDesc(current);
    }

    public Post toggleLike(Long postId, User user) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return null;

        PostLike existing = likeRepository.findByPostAndUser(post, user).orElse(null);
        if (existing != null) {
            likeRepository.delete(existing);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            PostLike newLike = new PostLike();
            newLike.setPost(post);
            newLike.setUser(user);
            likeRepository.save(newLike);
            post.setLikeCount(post.getLikeCount() + 1);

            sendNotification(post.getAuthor(), user, "POST_LIKE", "Liked your post", user.getUsername() + " liked your post: \"" + truncate(post.getContent(), 30) + "\"", "/dashboard/feed");
        }
        return postRepository.save(post);
    }

    public Post sharePost(Long postId, User user) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return null;

        post.setShareCount(post.getShareCount() + 1);
        sendNotification(post.getAuthor(), user, "POST_SHARE", "Shared your post", user.getUsername() + " shared your post: \"" + truncate(post.getContent(), 30) + "\"", "/dashboard/feed");
        
        return postRepository.save(post);
    }

    public PostComment addComment(Long postId, User author, String content, Long parentCommentId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return null;

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(content);
        comment.setParentCommentId(parentCommentId);
        PostComment saved = commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        sendNotification(post.getAuthor(), author, "POST_COMMENT", "Commented on your post", author.getUsername() + " commented: \"" + truncate(content, 30) + "\"", "/dashboard/feed");
        return saved;
    }

    public List<PostComment> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return List.of();
        return commentRepository.findByPostOrderByCreatedAtAsc(post);
    }

    public ConnectionRequest sendConnectionRequest(User sender, Long receiverId) {
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver == null || sender.getId().equals(receiver.getId())) return null;

        ConnectionRequest request = new ConnectionRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus("PENDING");
        ConnectionRequest saved = connectionRequestRepository.save(request);

        sendNotification(receiver, sender, "CONNECTION_REQUEST", "Connection Request", sender.getUsername() + " sent you a connection request.", "/dashboard/network");
        return saved;
    }

    public ConnectionRequest respondToConnectionRequest(Long requestId, String status, User user) {
        ConnectionRequest request = connectionRequestRepository.findById(requestId).orElse(null);
        if (request == null || !request.getReceiver().getId().equals(user.getId())) return null;

        request.setStatus(status);
        ConnectionRequest saved = connectionRequestRepository.save(request);

        if ("ACCEPTED".equalsIgnoreCase(status)) {
            // Make them follow each other
            User sender = request.getSender();
            
            user.getFollowers().add(sender);
            user.getFollowing().add(sender);
            
            sender.getFollowers().add(user);
            sender.getFollowing().add(user);
            
            userRepository.save(user);
            userRepository.save(sender);

            sendNotification(sender, user, "CONNECTION_ACCEPTED", "Connection Accepted", user.getUsername() + " accepted your connection request.", "/dashboard/network");
        }
        return saved;
    }

    public List<ConnectionRequest> getPendingConnectionRequests(User user) {
        return connectionRequestRepository.findByReceiverAndStatus(user, "PENDING");
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public Map<String, Object> toggleFollow(User current, Long targetUserId) {
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser == null || targetUser.getId().equals(current.getId())) {
            return Map.of("error", "Invalid user");
        }

        boolean isFollowing = targetUser.getFollowers().contains(current);
        if (isFollowing) {
            targetUser.getFollowers().remove(current);
            current.getFollowing().remove(targetUser);
        } else {
            targetUser.getFollowers().add(current);
            current.getFollowing().add(targetUser);
            sendNotification(targetUser, current, "NEW_FOLLOWER", "New follower", current.getUsername() + " started following you.", "/dashboard/network");
        }

        userRepository.save(targetUser);
        userRepository.save(current);

        return Map.of("following", !isFollowing);
    }

    public void sendNotification(User recipient, User actor, String type, String title, String message, String linkUrl) {
        if (recipient == null || (actor != null && recipient.getId().equals(actor.getId()))) return;
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setActor(actor);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setLinkUrl(linkUrl);
        notificationRepository.save(n);
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }
}
