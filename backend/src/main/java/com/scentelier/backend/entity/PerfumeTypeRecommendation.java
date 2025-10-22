package com.scentelier.backend.entity;

import com.scentelier.backend.constant.Category;
import com.scentelier.backend.constant.Note;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@Entity
@Table(name = "perfume_type_recommendation")
public class PerfumeTypeRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 아이디를 자동 생성해줌
    @Column(name = "recomend_id")
    private Long id;

    @Column(name = "perfume_type")
    private String perfumeType ; //원액타입

    @Column(name = "note_type")
    @Enumerated(EnumType.STRING)
    private Note noteType ; //노트

    @ManyToOne(fetch = FetchType.LAZY) //일대일 연관 관계 매핑, 지연 로딩
    @JoinColumn(name = "ingredient_id") // 외래키 지정
    private Ingredient ingredients ; //향료아이디
}
