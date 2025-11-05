package com.scentelier.backend.repository;

import com.scentelier.backend.dto.UserAdminDto;
import com.scentelier.backend.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {

    Optional<Users> findByEmail(String email);
    
    // 최근 30일간 생성된 유저 수 반환
    @Query("SELECT COUNT(u) FROM Users u WHERE u.createdAt >= :date")
    int countNewUsersSince(@Param("date") java.time.LocalDate date);

    // 관리자 유저관리창 쿼리
    @Query("SELECT " +
            "u.id, u.username, u.email, u.phone, u.address, u.role, u.createdAt, u.isDeleted, " +
            "COUNT(DISTINCT o.id) AS totalOrders, " + // Add alias
            "COALESCE(SUM(CASE WHEN o.status <> 'CANCELLED' THEN o.totalPrice ELSE 0 END), 0.00) AS totalExpenditure " + // Add alias
            "FROM Users u LEFT JOIN Orders o ON u.id = o.users.id " +
            "WHERE (:search IS NULL OR u.username LIKE %:search% OR u.email LIKE %:search%) " +
            "AND (:status IS NULL " +
            "  OR (:status = 'ACTIVE' AND u.isDeleted = false) " +
            "  OR (:status = 'INACTIVE' AND u.isDeleted = true)" +
            ") " +
            "GROUP BY u.id")
    Page<Object[]> findUsersWithStats( // Return Page<Object[]>
                                       Pageable pageable,
                                       @Param("search") String search,
                                       @Param("status") String status
    );

    @Query("SELECT " +
            "u.id, u.username, u.email, u.phone, u.address, u.role, u.createdAt, u.isDeleted, " +
            "COUNT(DISTINCT o.id) AS totalOrders, " +
            "COALESCE(SUM(CASE WHEN o.status <> 'CANCELLED' THEN o.totalPrice ELSE 0 END), 0.00) AS totalExpenditure " +
            "FROM Users u LEFT JOIN Orders o ON u.id = o.users.id " +
            "WHERE u.id = :id " +
            "GROUP BY u.id")
    Optional<Object[]> findUserWithStatsById(@Param("id") Long id); // Return Optional<Object[]>
}
