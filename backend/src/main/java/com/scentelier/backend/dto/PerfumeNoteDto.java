package com.scentelier.backend.dto;

public class PerfumeNoteDto {

    private String noteType;
    private String ingredientName;
    private String ingredientImgUrl;

    public PerfumeNoteDto(String noteType, String ingredientName, String ingredientImgUrl) {
        this.noteType = noteType;
        this.ingredientName = ingredientName;
        this.ingredientImgUrl = ingredientImgUrl;
    }

    public String getNoteType() { return noteType; }
    public String getIngredientName() { return ingredientName; }
    public String getIngredientImgUrl() { return ingredientImgUrl; }
}
