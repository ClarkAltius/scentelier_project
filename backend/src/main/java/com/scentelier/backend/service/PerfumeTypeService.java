package com.scentelier.backend.service;

import com.scentelier.backend.dto.PerfumeNoteDto;
import com.scentelier.backend.entity.PerfumeTypeRecommendation;
import com.scentelier.backend.repository.PerfumeTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerfumeTypeService {
    private final PerfumeTypeRepository repository;

    public PerfumeTypeService(PerfumeTypeRepository repository) {
        this.repository = repository;
    }

//    public List<PerfumeTypeRecommendation> getNotesByType(String perfumeType) {
//        return repository.findByPerfumeType(perfumeType);
//    }

    public List<PerfumeNoteDto> getNotesByType(String perfumeType) {
        List<PerfumeTypeRecommendation> result = repository.findByPerfumeType(perfumeType);

        List<PerfumeNoteDto> dtoList = result.stream()
                .map(r -> new PerfumeNoteDto(
                        r.getNoteType().name(),
                        r.getIngredients().getName(),
                        r.getIngredients().getImgUrl()
                ))
                .collect(Collectors.toList());

        return dtoList;
    }

}
