package com.freshgreens.app.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.freshgreens.app.model.Category;
import com.freshgreens.app.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Cacheable(value = "categories")
    public List<Category> getCategoriesCached() {
        System.out.println("====== FETCHING CATEGORIES FROM DATABASE ======");
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }
}
