package com.employee.system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.system.entity.Post;
import com.employee.system.entity.PostComment;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostOrderByCreatedAtAsc(Post post);
}
