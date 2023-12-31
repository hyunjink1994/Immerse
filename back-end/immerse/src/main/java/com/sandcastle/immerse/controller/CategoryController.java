package com.sandcastle.immerse.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.sandcastle.immerse.model.dto.CategoryDto;
import com.sandcastle.immerse.model.entity.CategoryEntity;
import com.sandcastle.immerse.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

	private final CategoryService categoryService;

	@ResponseBody
	@GetMapping("/")
	public List<CategoryDto> getCategories() {
		return categoryService.findCategories();
	}

	@ResponseBody
	@PostMapping("/")
	public Long postCategory(@RequestBody CategoryDto req) {
		CategoryEntity category = CategoryEntity.builder()
			.categoryName(req.getCategoryName())
			.categoryThumbnail(req.getCategoryThumbnail())
			.defaultThumbnail(req.getDefaultThumbnail())
			.build();
		return categoryService.postCategory(req);
	}
}
