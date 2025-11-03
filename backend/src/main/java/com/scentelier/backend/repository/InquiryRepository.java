package com.scentelier.backend.repository;

import com.scentelier.backend.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import com.scentelier.backend.constant.Type;

import java.util.List;
import com.scentelier.backend.constant.InquiryStatus;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserId(Long userId); // userId로 조회

    @Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.user")
    List<Inquiry> findAllWithUser();

    List<Inquiry> findByUserIdAndIsDeletedFalse(Long userId);

    // 상태별 총 문의사항 반환
    int countByStatus(InquiryStatus status);

    @Query(value = "SELECT i FROM Inquiry i LEFT JOIN FETCH i.user i_user " + // i_user is an alias for the joined user
            "WHERE (:search IS NULL OR LOWER(i.title) LIKE :search OR LOWER(i_user.username) LIKE :search OR LOWER(i_user.email) LIKE :search) " +
            "AND (:type IS NULL OR i.type = :type) " +
            "AND (:status IS NULL OR i.status = :status)",

            countQuery = "SELECT count(i) FROM Inquiry i LEFT JOIN i.user i_user " + // No FETCH in count query
                    "WHERE (:search IS NULL OR LOWER(i.title) LIKE :search OR LOWER(i_user.username) LIKE :search OR LOWER(i_user.email) LIKE :search) " +
                    "AND (:type IS NULL OR i.type = :type) " +
                    "AND (:status IS NULL OR i.status = :status)")
    Page<Inquiry> findAllWithUserForPage(Pageable pageable,
                                         @Param("search") String search,
                                         @Param("type") Type type,
                                         @Param("status") InquiryStatus status);
}