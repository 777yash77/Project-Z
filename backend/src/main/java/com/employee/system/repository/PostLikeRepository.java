package com.employee.system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Post;
import com.employee.system.entity.PostLike;
import com.employee.system.entity.User;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostAndUser(Post post, User user);
    boolean existsByPostAndUser(Post post, User user);
    java.util.List<PostLike> findByUser(User user);
    java.util.List<PostLike> findByPost(Post post);
}
